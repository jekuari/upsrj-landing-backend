import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../entities/lead.entity';

export class UpdateLeadStatusDto {
  @ApiProperty({ example: 'acknowledged', enum: ['new', 'acknowledged', 'contacted'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['new', 'acknowledged', 'contacted'])
  status: LeadStatus;
}
