import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'Welcome Email', description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Welcome to UPSRJ', description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<p>Hello {{name}},...</p>', description: 'Email body HTML' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
