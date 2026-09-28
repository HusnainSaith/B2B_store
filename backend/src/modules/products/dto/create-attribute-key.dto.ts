import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeKeyDto {
  @ApiProperty({ example: 'Color', description: 'Attribute name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'color', description: 'URL-safe slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiProperty({
    example: 'swatch',
    description: 'Input type',
    enum: ['select', 'swatch', 'text', 'boolean'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['select', 'swatch', 'text', 'boolean'])
  @MaxLength(30)
  inputType: string;
}
