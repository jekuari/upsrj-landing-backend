import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Juan Arturo Pérez', description: 'Full name of the lead' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'juan@gmail.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '442-123-4567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;
}
