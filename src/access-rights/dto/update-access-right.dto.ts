import { ApiProperty } from '@nestjs/swagger';
import { CreateAccessRightDto } from './create-access-right.dto';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateAccessRightDto {

    @ApiProperty({
        description: 'Permission to create resources',
        type: "boolean"
    })
    @IsBoolean()
    @IsOptional()
    canCreate: boolean;

    @ApiProperty({
        description: 'Permission to read resources',
        type: "boolean"
    })
    @IsBoolean()
    @IsOptional()
    canRead: boolean;

    @ApiProperty({
        description: 'Permission to update resources',
        type: "boolean"
    })
    @IsBoolean()
    @IsOptional()
    canUpdate: boolean;

    @ApiProperty({
        description: 'Permission to delete resources',
        type: "boolean"
    })
    @IsBoolean()
    @IsOptional()
    canDelete: boolean;
}
