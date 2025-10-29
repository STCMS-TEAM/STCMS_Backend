import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'newpassword123', minLength: 6, description: 'Password aggiornata' })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;
}
