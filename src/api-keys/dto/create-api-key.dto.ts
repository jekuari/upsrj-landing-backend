import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  expiresAt: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
