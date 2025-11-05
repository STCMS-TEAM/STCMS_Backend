import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class VolleyballResultDto {
    @ApiProperty({
        example: { '665a9f3dc2a8ab0012345678': 3, '665a9f3dc2a8ab0099999999': 1 },
        description: 'Chiavi = ID dei team, valori = punteggi',
    })
    @IsObject()
    score: Record<string, number>;

    @ApiProperty({
        example: [
            { '665a9f3dc2a8ab0012345678': 25, '665a9f3dc2a8ab0099999999': 21 },
            { '665a9f3dc2a8ab0012345678': 23, '665a9f3dc2a8ab0099999999': 25 },
            { '665a9f3dc2a8ab0012345678': 25, '665a9f3dc2a8ab0099999999': 17 },
        ],
        description: 'Chiavi = ID dei team, valori = punteggi',
    })
    @IsArray()
    partials: Array<Record<string, number>>;
}
