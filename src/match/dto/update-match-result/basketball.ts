import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class BasketballResultDto {
    @ApiProperty({
        description: 'Punteggio totale per ogni squadra',
        example: { team1: 87, team2: 86 },
    })
    @IsObject()
    score: Record<string, number>;

    @ApiProperty({
        description: 'Punteggi parziali per ogni quarto o periodo',
        example: [
            { team1: 25, team2: 20 },
            { team1: 18, team2: 22 },
            { team1: 24, team2: 19 },
            { team1: 20, team2: 25 },
        ],
    })
    @IsArray()
    partials: Array<Record<string, number>>;
}
