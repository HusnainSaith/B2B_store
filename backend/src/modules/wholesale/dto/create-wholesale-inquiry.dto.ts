import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsISO31661Alpha2,
  IsNumber,
  IsOptional,
  Matches,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWholesaleInquiryItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ minimum: 1, maximum: 1000000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  requestedQuantity: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  targetUnitPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CreateWholesaleInquiryDto {
  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 200)
  companyName: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 200)
  contactName: string;

  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(320)
  contactEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^(?=.*\d)[+0-9(][0-9\s().-]{6,24}$/, {
    message: 'contactPhone must be a valid phone or WhatsApp number',
  })
  contactPhone?: string;

  @ApiProperty({ example: 'PK' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsISO31661Alpha2()
  deliveryCountry: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(120)
  deliveryCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(3000)
  notes?: string;

  @ApiProperty({ type: [CreateWholesaleInquiryItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateWholesaleInquiryItemDto)
  items: CreateWholesaleInquiryItemDto[];
}
