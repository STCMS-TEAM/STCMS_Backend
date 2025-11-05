import { Type } from 'class-transformer';
import {ValidateNested, IsInt, Min, IsObject, IsArray} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SoccerResultDto {
    @ApiProperty({
        example: { '665a9f3dc2a8ab0012345678': 3, '665a9f3dc2a8ab0099999999': 1 },
        description: 'Chiavi = ID dei team, valori = punteggi',
    })
    @IsObject()
    score: Record<string, number>;
}
