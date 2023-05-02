import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ default: 0, description: 'Number of items to skip' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number) // Si no volem posar al main: enableImplicitConversion: true
  offset?: number;
}
