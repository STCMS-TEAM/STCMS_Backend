import { Type } from 'class-transformer';
import { ValidateNested, IsInt, Min } from 'class-validator';

class ScoreDto {
    @IsInt()
    @Min(0)
    team1: number;

    @IsInt()
    @Min(0)
    team2: number;
}

export class SoccerResultDto {
    @ValidateNested()
    @Type(() => ScoreDto)
    score: ScoreDto;
}
