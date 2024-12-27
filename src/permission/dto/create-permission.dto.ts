import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({
        description: 'Module name that is assigned in an interface',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    module_name: string;

    @ApiProperty({
        description: 'Permission to create resources',
        type: Boolean,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    create?: boolean;

    @ApiProperty({
        description: 'Permission to read resources',
        type: Boolean,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    read?: boolean;

    @ApiProperty({
        description: 'Permission to update resources',
        type: Boolean,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    update?: boolean;

    @ApiProperty({
        description: 'Permission to delete resources',
        type: Boolean,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    delete?: boolean;

    @ApiProperty({
        description: 'ID of the user to whom the permission is assigned',
        type: String,
        format: 'uuid',
    })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'ID of the module to which the permission belongs',
        type: String,
        format: 'uuid',
    })
    @IsNotEmpty()
    @IsUUID()
    moduleId: string;
}
