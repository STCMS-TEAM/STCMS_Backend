import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Leonardo', description: 'Nome dell’utente' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Sartori', description: 'Cognome dell’utente' })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: 'user@example.com', description: 'Email dell’utente' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6, description: 'Password dell’utente' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ enum: ['male', 'female', 'other'], description: 'Genere dell’utente' })
    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({ example: '+391234567890', description: 'Numero di telefono dell’utente' })
    @IsString()
    @IsOptional()
    phone_number?: string;
}
