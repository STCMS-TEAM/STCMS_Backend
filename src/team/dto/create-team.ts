import { ApiProperty } from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsString, IsArray, ArrayNotEmpty, ArrayUnique} from 'class-validator';
import { Types } from 'mongoose';

export class CreateTeamDto {
    @ApiProperty({ example: 'Team Alfa', description: 'Nome della squadra' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: ['64f1c1e8e3a0f123456789ab'], description: 'Array di ID dei giocatori' })
    @IsArray()
    @ArrayUnique()
    @IsMongoId({ each: true })
    players: Types.ObjectId[];
}
