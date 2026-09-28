import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from '../../common/modules/guards.module';
import { SharedModule } from '../shared/shared.module';
import { Store } from './entities/store.entity';
import { StoresController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), SharedModule, GuardsModule],
  controllers: [StoresController],
  providers: [SellersService],
  exports: [SellersService, TypeOrmModule],
})
export class SellersModule {}
