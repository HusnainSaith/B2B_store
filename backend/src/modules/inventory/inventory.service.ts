import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Warehouse) private warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private dataSource: DataSource,
  ) {}

  private hasReturnedRows(result: unknown): boolean {
    const rows = Array.isArray(result) && Array.isArray(result[0])
      ? result[0]
      : result;
    return Array.isArray(rows) && rows.length > 0;
  }

  async createWarehouse(dto: Partial<Warehouse>): Promise<Warehouse> {
    const wh = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(wh);
  }

  async findAllWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepo.find({ order: { name: 'ASC' } });
  }

  async findWarehouse(id: string): Promise<Warehouse> {
    const wh = await this.warehouseRepo.findOne({ where: { id } });
    if (!wh) throw new NotFoundException('Warehouse not found');
    return wh;
  }

  async updateWarehouse(
    id: string,
    dto: Partial<Warehouse>,
  ): Promise<Warehouse> {
    const wh = await this.findWarehouse(id);
    Object.assign(wh, dto);
    return this.warehouseRepo.save(wh);
  }

  async removeWarehouse(id: string): Promise<void> {
    const wh = await this.findWarehouse(id);
    await this.warehouseRepo.remove(wh);
  }

  async setStock(
    warehouseId: string,
    variantId: string,
    qtyOnHand: number,
    lowStockThreshold = 0,
  ): Promise<Inventory> {
    // Atomic upsert to avoid race condition
    const result = await this.dataSource.query(
      `INSERT INTO inventory (warehouse_id, variant_id, qty_on_hand, low_stock_threshold)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (warehouse_id, variant_id)
       DO UPDATE SET qty_on_hand = $3, low_stock_threshold = $4
       WHERE inventory.qty_reserved <= $3
       RETURNING *`,
      [warehouseId, variantId, qtyOnHand, lowStockThreshold],
    );
    if (!this.hasReturnedRows(result)) {
      throw new BadRequestException(
        'Stock on hand cannot be lower than already reserved stock',
      );
    }
    return this.inventoryRepo.findOne({ where: { warehouseId, variantId } });
  }

  async adjustStock(
    warehouseId: string,
    variantId: string,
    delta: number,
  ): Promise<Inventory> {
    // Atomic increment to avoid lost-update race condition
    const result = await this.dataSource.query(
      `UPDATE inventory SET qty_on_hand = qty_on_hand + $1
       WHERE warehouse_id = $2 AND variant_id = $3
         AND qty_on_hand + $1 >= qty_reserved
       RETURNING *`,
      [delta, warehouseId, variantId],
    );
    if (!this.hasReturnedRows(result))
      throw new BadRequestException(
        'Inventory not found or adjustment would make available stock negative',
      );
    return this.inventoryRepo.findOne({ where: { warehouseId, variantId } });
  }

  async reserveStock(
    warehouseId: string,
    variantId: string,
    qty: number,
  ): Promise<Inventory> {
    // Atomic increment to avoid lost-update race condition
    const result = await this.dataSource.query(
      `UPDATE inventory SET qty_reserved = qty_reserved + $1
       WHERE warehouse_id = $2 AND variant_id = $3
         AND qty_reserved + $1 <= qty_on_hand
       RETURNING *`,
      [qty, warehouseId, variantId],
    );
    if (!this.hasReturnedRows(result))
      throw new BadRequestException('Insufficient available stock');
    return this.inventoryRepo.findOne({ where: { warehouseId, variantId } });
  }

  async releaseReservation(
    warehouseId: string,
    variantId: string,
    qty: number,
  ): Promise<Inventory> {
    // Atomic decrement, clamped at 0
    const result = await this.dataSource.query(
      `UPDATE inventory SET qty_reserved = GREATEST(0, qty_reserved - $1)
       WHERE warehouse_id = $2 AND variant_id = $3
       RETURNING *`,
      [qty, warehouseId, variantId],
    );
    if (!this.hasReturnedRows(result))
      throw new NotFoundException('Inventory record not found');
    return this.inventoryRepo.findOne({ where: { warehouseId, variantId } });
  }

  async getInventory(
    warehouseId?: string,
    variantId?: string,
  ): Promise<Inventory[]> {
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (variantId) where.variantId = variantId;
    return this.inventoryRepo.find({
      where,
      relations: ['warehouse', 'variant'],
    });
  }

  async getLowStock(): Promise<Inventory[]> {
    return this.inventoryRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.warehouse', 'warehouse')
      .leftJoinAndSelect('i.variant', 'variant')
      .where('i.qtyOnHand - i.qtyReserved <= i.lowStockThreshold')
      .getMany();
  }
}
