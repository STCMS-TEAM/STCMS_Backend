import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsString, IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateTeamDto {
    @ApiPropertyOptional({
        example: 'Team Beta',
        description: 'Nuovo nome della squadra',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        example: ['64f1c1e8e3a0f123456789ab', '64f1c1e8e3a0f123456789ac'],
        description: 'Nuovo elenco di giocatori nel team',
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    players?: Types.ObjectId[];
}
