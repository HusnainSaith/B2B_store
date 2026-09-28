import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuotationStatus } from '../enums/wholesale.enum';
import { WholesaleInquiry } from './wholesale-inquiry.entity';
import { WholesaleQuotationItem } from './wholesale-quotation-item.entity';

@Entity('wholesale_quotations')
@Index(['inquiryId', 'createdAt'])
export class WholesaleQuotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  reference: string;

  @Column({ name: 'inquiry_id', type: 'uuid' })
  inquiryId: string;

  @ManyToOne(() => WholesaleInquiry, (inquiry) => inquiry.quotations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: WholesaleInquiry;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'varchar', length: 30, default: QuotationStatus.SENT })
  status: QuotationStatus;

  @Column({ type: 'char', length: 3 })
  currency: string;

  @Column({ type: 'numeric', precision: 14, scale: 4 })
  subtotal: number;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 14,
    scale: 4,
    default: 0,
  })
  discountAmount: number;

  @Column({
    name: 'shipping_amount',
    type: 'numeric',
    precision: 14,
    scale: 4,
    default: 0,
  })
  shippingAmount: number;

  @Column({
    name: 'tax_amount',
    type: 'numeric',
    precision: 14,
    scale: 4,
    default: 0,
  })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 4 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  terms: string | null;

  @Column({
    name: 'internal_notes',
    type: 'text',
    nullable: true,
    select: false,
  })
  internalNotes: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;

  @OneToMany(() => WholesaleQuotationItem, (item) => item.quotation, {
    cascade: true,
  })
  items: WholesaleQuotationItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
