import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  name?: string;

  @IsArray()
  @ArrayNotEmpty()
  permissions?: string[];
}
