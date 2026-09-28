import { IsIn, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator';

export class CreateCheckoutDto {
  @IsString() @MaxLength(100) idempotencyKey: string;
  @IsIn(['cash_on_delivery', 'stripe']) paymentMethod: string;
  @IsString() shippingLine1: string;
  @IsString() @MaxLength(100) shippingCity: string;
  @IsString() @Length(2, 2) shippingCountry: string;
  @IsOptional() @IsString() @MaxLength(100) shippingState?: string;
  @IsOptional() @IsString() @MaxLength(20) shippingPostalCode?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) successUrl?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) cancelUrl?: string;
}
