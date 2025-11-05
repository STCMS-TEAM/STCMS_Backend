import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class BasketballResultDto {
    @ApiProperty({
        description: 'Punteggio totale per ogni squadra. Chiavi = ID dei team, valori = punteggi',
        example: { '665a9f3dc2a8ab0012345678': 87, '665a9f3dc2a8ab0099999999': 86 },
    })
    @IsObject()
    score: Record<string, number>;

    @ApiProperty({
        description: 'Punteggi parziali per ogni quarto o periodo',
        example: [
            { '665a9f3dc2a8ab0012345678': 25, '665a9f3dc2a8ab0099999999': 20 },
            { '665a9f3dc2a8ab0012345678': 18, '665a9f3dc2a8ab0099999999': 22 },
            { '665a9f3dc2a8ab0012345678': 24, '665a9f3dc2a8ab0099999999': 19 },
            { '665a9f3dc2a8ab0012345678': 20, '665a9f3dc2a8ab0099999999': 25 },
        ],
    })
    @IsArray()
    partials: Array<Record<string, number>>;
}
