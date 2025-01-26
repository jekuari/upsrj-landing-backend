import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePermissionDto {

    @IsBoolean()
    @IsOptional()
    create?: boolean;

    @IsBoolean()
    @IsOptional()
    read?: boolean;

    @IsBoolean()
    @IsOptional()
    update?: boolean;

    @IsBoolean()
    @IsOptional()
    delete?: boolean;
}