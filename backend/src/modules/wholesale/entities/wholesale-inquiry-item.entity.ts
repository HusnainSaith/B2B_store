import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { WholesaleInquiry } from './wholesale-inquiry.entity';

@Entity('wholesale_inquiry_items')
export class WholesaleInquiryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_id', type: 'uuid' })
  inquiryId: string;

  @ManyToOne(() => WholesaleInquiry, (inquiry) => inquiry.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: WholesaleInquiry;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'requested_quantity', type: 'int' })
  requestedQuantity: number;

  @Column({ name: 'sku_snapshot', type: 'varchar', length: 200 })
  skuSnapshot: string;

  @Column({ name: 'product_name_snapshot', type: 'varchar', length: 300 })
  productNameSnapshot: string;

  @Column({
    name: 'target_unit_price',
    type: 'numeric',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  targetUnitPrice: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
