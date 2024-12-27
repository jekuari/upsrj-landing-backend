import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";


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
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password:string;
}

