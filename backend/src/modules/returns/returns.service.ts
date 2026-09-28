import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Return } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Order } from '../orders/entities/order.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { MailService } from '../../common/modules/mail/mail.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return) private returnRepo: Repository<Return>,
    @InjectRepository(ReturnItem)
    private returnItemRepo: Repository<ReturnItem>,
    private dataSource: DataSource,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async create(
    dto: Partial<Return>,
    items?: Partial<ReturnItem>[],
  ): Promise<Return> {
    dto.status = 'requested';
    // Verify the order belongs to the caller
    if (dto.orderId && dto.userId) {
      const order = await this.dataSource
        .getRepository(Order)
        .findOne({ where: { id: dto.orderId as string } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.userId !== dto.userId)
        throw new BadRequestException('Order does not belong to you');
      if (order.status !== 'delivered') {
        throw new BadRequestException('Only delivered orders can be returned');
      }
      if (!items?.length) throw new BadRequestException('Return items are required');
      for (const item of items) {
        const result = await this.dataSource.query(
          `SELECT oi.quantity - COALESCE(SUM(CASE WHEN r.status <> 'rejected' THEN ri.quantity ELSE 0 END), 0)::int AS remaining
           FROM order_items oi
           LEFT JOIN return_items ri ON ri.order_item_id = oi.id
           LEFT JOIN returns r ON r.id = ri.return_id
           WHERE oi.id = $1 AND oi.order_id = $2 GROUP BY oi.id`,
          [item.orderItemId, dto.orderId],
        );
        const rows = Array.isArray(result?.[0]) ? result[0] : result;
        if (!rows?.length || Number(item.quantity) > Number(rows[0].remaining)) {
          throw new BadRequestException('Invalid or excessive return quantity');
        }
      }
    }
    const saved = await this.dataSource.transaction(async (em) => {
      const ret = em.create(Return, dto);
      const savedRet = await em.save(ret);
      if (items?.length) {
        const returnItems = items.map((i) =>
          em.create(ReturnItem, { ...i, returnId: savedRet.id }),
        );
        await em.save(returnItems);
      }
      return savedRet;
    });

    if (dto.userId) {
      this.notificationHelper
        .notify(dto.userId as string, 'RETURN_REQUESTED', {
          orderId: (dto.orderId as string) || '',
        })
        .catch(() => {});
    }

    // Send return request email
    if (dto.userId) {
      const ret2 = await this.returnRepo.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });
      if (ret2?.user) {
        this.mailService
          .sendReturnRequestedEmail(
            ret2.user.email,
            ret2.user.firstName || 'Customer',
            saved.id,
            (dto.orderId as string) || '',
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async findAll(options?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Return[]> {
    const where: any = {};
    if (options?.userId) where.userId = options.userId;
    if (options?.status) where.status = options.status;
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    return this.returnRepo.find({
      where,
      relations: ['order', 'user'],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<Return> {
    const ret = await this.returnRepo.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
    if (!ret) throw new NotFoundException('Return not found');
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, ret.userId);
    return ret;
  }

  async findItems(
    returnId: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<ReturnItem[]> {
    if (callerId) {
      const ret = await this.returnRepo.findOne({ where: { id: returnId } });
      if (!ret) throw new NotFoundException('Return not found');
      enforceOwnerOrAdmin(callerId, callerRole, ret.userId);
    }
    return this.returnItemRepo.find({
      where: { returnId },
      relations: ['orderItem'],
    });
  }

  async updateStatus(
    id: string,
    status: string,
    reviewedBy?: string,
    refundAmount?: number,
  ): Promise<Return> {
    const ret = await this.findOne(id);
    const transitions: Record<string, string[]> = {
      requested: ['approved', 'rejected'], approved: ['item_shipped'],
      item_shipped: ['item_received'], item_received: ['inspecting'],
      inspecting: ['refund_processed', 'exchanged', 'rejected'],
      refund_processed: ['closed'], exchanged: ['closed'], rejected: [], closed: [],
    };
    if (!(transitions[ret.status] || []).includes(status)) {
      throw new BadRequestException(`Cannot transition return from ${ret.status} to ${status}`);
    }
    if (refundAmount !== undefined) {
      const totals = await this.dataSource.query(
        `SELECT COALESCE(SUM(ri.quantity * oi.unit_price), 0)::numeric AS maximum
         FROM return_items ri JOIN order_items oi ON oi.id = ri.order_item_id
         WHERE ri.return_id = $1`,
        [id],
      );
      const totalRows = Array.isArray(totals?.[0]) ? totals[0] : totals;
      if (refundAmount < 0 || refundAmount > Number(totalRows?.[0]?.maximum || 0)) {
        throw new BadRequestException('Refund amount exceeds returned item value');
      }
    }
    let saved: Return;
    if (status === 'item_received') {
      saved = await this.dataSource.transaction(async (manager) => {
        const returnItems = await manager.query(
          `SELECT ri.quantity, oi.variant_id
           FROM return_items ri JOIN order_items oi ON oi.id = ri.order_item_id
           WHERE ri.return_id = $1`,
          [id],
        );
        const itemRows = Array.isArray(returnItems?.[0]) ? returnItems[0] : returnItems;
        for (const item of itemRows || []) {
          let remaining = Number(item.quantity);
          const allocations = await manager.query(
            `SELECT warehouse_id, -quantity AS sold
             FROM inventory_movements
             WHERE order_id = $1 AND variant_id = $2 AND movement_type = 'sale'
             ORDER BY created_at`,
            [ret.orderId, item.variant_id],
          );
          const allocationRows = Array.isArray(allocations?.[0]) ? allocations[0] : allocations;
          for (const allocation of allocationRows || []) {
            if (!remaining) break;
            const qty = Math.min(remaining, Number(allocation.sold));
            await manager.query(
              `UPDATE inventory SET qty_on_hand = qty_on_hand + $1
               WHERE warehouse_id = $2 AND variant_id = $3`,
              [qty, allocation.warehouse_id, item.variant_id],
            );
            await manager.query(
              `INSERT INTO inventory_movements
              (order_id, warehouse_id, variant_id, movement_type, quantity, note, reference_id)
               VALUES ($1, $2, $3, 'return', $4, $5, $6)`,
              [ret.orderId, allocation.warehouse_id, item.variant_id, qty, `Return ${id}`, id],
            );
            remaining -= qty;
          }
        }
        ret.status = status;
        if (reviewedBy) ret.reviewedBy = reviewedBy;
        if (refundAmount !== undefined) ret.refundAmount = refundAmount;
        return manager.save(Return, ret);
      });
    } else {
      ret.status = status;
      if (reviewedBy) ret.reviewedBy = reviewedBy;
      if (refundAmount !== undefined) ret.refundAmount = refundAmount;
      saved = await this.returnRepo.save(ret);
    }

    if (ret.userId) {
      const templateKey =
        status === 'approved' ? 'RETURN_APPROVED' : 'ORDER_STATUS_UPDATED';
      this.notificationHelper
        .notify(ret.userId, templateKey, { orderId: ret.orderId || '' })
        .catch(() => {});
      // Send return status update email
      const withUser = await this.returnRepo.findOne({
        where: { id },
        relations: ['user'],
      });
      if (withUser?.user) {
        this.mailService
          .sendReturnStatusUpdateEmail(
            withUser.user.email,
            withUser.user.firstName || 'Customer',
            id,
            status,
          )
          .catch(() => {});
      }
    }

    return saved;
  }
}
