import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { WholesaleQuotation } from './wholesale-quotation.entity';

@Entity('wholesale_quotation_items')
export class WholesaleQuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quotation_id', type: 'uuid' })
  quotationId: string;

  @ManyToOne(() => WholesaleQuotation, (quotation) => quotation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id' })
  quotation: WholesaleQuotation;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'sku_snapshot', type: 'varchar', length: 200 })
  skuSnapshot: string;

  @Column({ name: 'product_name_snapshot', type: 'varchar', length: 300 })
  productNameSnapshot: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 14, scale: 4 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 14, scale: 4 })
  lineTotal: number;
}
