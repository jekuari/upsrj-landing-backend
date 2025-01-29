import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{

    @ApiProperty({
        example: 'AndreaStudent@gmail.com',
        description: 'Correo del Usuario',
        type: "string"
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;

    @ApiProperty({
        example: 'Abc123',
        description: 'The password must have a Uppercase, lowercase letter and a number',
        type: "string"
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password:string;

    @ApiProperty({
        example: 'Andrea Lopez',
        description: 'Nombre completo de los usuarios',
        type: "string"
    })
    @IsString()
    @MinLength(1)
    fullName:string;

    @ApiProperty({
        example: '021000615',
        description: 'Matricula de los usuarios',
        type: "string"
    })
    @IsString()
    @MinLength(8)
    @MaxLength(9)
    matricula:string;
}