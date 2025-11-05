import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class VolleyballResultDto {
    @ApiProperty({ example: { team1: 3, team2: 1 } })
    @IsObject()
    score: Record<string, number>;

    @ApiProperty({
        example: [
            { team1: 25, team2: 21 },
            { team1: 23, team2: 25 },
            { team1: 25, team2: 17 },
        ],
    })
    @IsArray()
    partials: Array<Record<string, number>>;
}
