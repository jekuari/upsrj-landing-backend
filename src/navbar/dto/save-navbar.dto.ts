import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NavbarItemDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsBoolean()
  isOpenNewTab?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavbarItemDto)
  children?: NavbarItemDto[];
}

export class SaveNavbarDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavbarItemDto)
  mainLinks: NavbarItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavbarItemDto)
  soyCoyoteLinks: NavbarItemDto[];
}
