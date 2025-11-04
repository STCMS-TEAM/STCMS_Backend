import { ApiProperty } from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsString, IsArray, ArrayNotEmpty, ArrayUnique, IsEmail} from 'class-validator';
import { Types } from 'mongoose';

export class CreateTeamDto {
    @ApiProperty({ example: 'Team Alfa', description: 'Nome della squadra' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: ['user@email.com'], description: 'Array di email dei giocatori' })
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    players: string[];
}
