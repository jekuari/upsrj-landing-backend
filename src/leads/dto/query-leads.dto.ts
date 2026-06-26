import { IsOptional, IsString, IsIn, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../entities/lead.entity';

export class QueryLeadsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Number of records per page' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'juan', description: 'Search term (matches name, email, phone)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['new', 'acknowledged', 'contacted'], description: 'Filter by status' })
  @IsOptional()
  @IsString()
  @IsIn(['new', 'acknowledged', 'contacted'])
  status?: LeadStatus;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortField?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'], description: 'Sort direction' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
