import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { CreateUserDto } from "./create-user.dto";


export class UpdateUserDto{
    @ApiProperty({
        example: 'AndreaStudent@gmail.com',
        description: 'Correo del Usuario',
        type: "string"
    })
    @IsString()
    @IsOptional()
    @IsEmail()
    email?:string;

    
    @ApiProperty({
        example: 'Abc123',
        description: 'The password must have a Uppercase, lowercase letter and a number',
        type: "string"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @IsOptional()
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password?:string;

    @ApiProperty({
        example: '021000615',
        description: 'Matricula de los usuarios',
        type: "string"
    })
    @IsString()
    @MinLength(8)
    @IsOptional()
    @MaxLength(9)
    matricula?:string;

    @ApiProperty({
        example: 'Andrea Lopez',
        description: 'Nombre completo de los usuarios',
        type: "string"
    })
    @IsString()
    @IsOptional()
    @MinLength(1)
    fullName?:string;

    @ApiProperty({
        example: 'Andrea Lopez',
        description: 'Nombre completo de los usuarios',
        type: "string"
    })
    @IsBoolean()
    @IsOptional()
    isActive?:boolean;


}

