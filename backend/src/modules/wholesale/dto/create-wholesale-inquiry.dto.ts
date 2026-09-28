import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsISO31661Alpha2,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
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
  @IsString()
  @Length(2, 200)
  companyName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  contactName: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(320)
  contactEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @ApiProperty({ example: 'PK' })
  @IsISO31661Alpha2()
  deliveryCountry: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deliveryCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
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
