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
import { InquiryStatus } from '../enums/wholesale.enum';
import { WholesaleInquiryItem } from './wholesale-inquiry-item.entity';
import { WholesaleQuotation } from './wholesale-quotation.entity';

@Entity('wholesale_inquiries')
@Index(['customerId', 'createdAt'])
@Index(['status', 'createdAt'])
export class WholesaleInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  reference: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'company_name', type: 'varchar', length: 200 })
  companyName: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 200 })
  contactName: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 320 })
  contactEmail: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  contactPhone: string | null;

  @Column({ name: 'delivery_country', type: 'char', length: 2 })
  deliveryCountry: string;

  @Column({
    name: 'delivery_city',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  deliveryCity: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 30, default: InquiryStatus.SUBMITTED })
  status: InquiryStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @OneToMany(() => WholesaleInquiryItem, (item) => item.inquiry, {
    cascade: true,
  })
  items: WholesaleInquiryItem[];

  @OneToMany(() => WholesaleQuotation, (quote) => quote.inquiry)
  quotations: WholesaleQuotation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
