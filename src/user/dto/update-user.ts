import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Leonardo', description: 'Nome aggiornato' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Sartori', description: 'Cognome aggiornato' })
    @IsString()
    @IsOptional()
    last_name?: string;

    @ApiPropertyOptional({ example: 'newpassword123', minLength: 6, description: 'Password aggiornata' })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ enum: ['male', 'female', 'other'], description: 'Genere aggiornato' })
    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({ example: '+391234567890', description: 'Numero di telefono aggiornato' })
    @IsString()
    @IsOptional()
    phone_number?: string;
}
