import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email dell’utente per l’autenticazione',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Password dell’utente',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
