import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ description: 'User full name', example: 'John Doe' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ description: 'User email address', example: 'example@gmail.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'User status', example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateUserStatusDto {
    @ApiProperty({description: 'User status', example: true})
    @IsBoolean()
    isActive: boolean;
}  
