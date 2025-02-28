import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

// DTO para el inicio de sesión de un usuario
export class LoginUserDto{

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
    password:string;
}

