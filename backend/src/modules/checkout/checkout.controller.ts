import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CheckoutController {
  constructor(private readonly service: CheckoutService) {}
  @Post()
  checkout(@CurrentUser() user: any, @Body() dto: CreateCheckoutDto) {
    return this.service.checkout(user, dto);
  }
}
