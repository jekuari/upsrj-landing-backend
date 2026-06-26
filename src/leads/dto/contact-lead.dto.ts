import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactLeadDto {
  @ApiProperty({ example: 'Regarding your inquiry', description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<p>Hello,...</p>', description: 'Email body (HTML)' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ example: 'My Custom Template', description: 'If set, saves as new email template' })
  @IsOptional()
  @IsString()
  saveAsTemplateName?: string;
}
