import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from '../../common/modules/guards.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  WholesaleInquiry,
  WholesaleInquiryItem,
  WholesaleQuotation,
  WholesaleQuotationItem,
} from './entities';
import { WholesaleController } from './wholesale.controller';
import { WholesaleService } from './wholesale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WholesaleInquiry,
      WholesaleInquiryItem,
      WholesaleQuotation,
      WholesaleQuotationItem,
    ]),
    GuardsModule,
    NotificationsModule,
  ],
  controllers: [WholesaleController],
  providers: [WholesaleService],
  exports: [WholesaleService],
})
export class WholesaleModule {}
