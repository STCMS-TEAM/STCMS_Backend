import { VolleyballResultDto } from './update-match-result/volleyball';
import { BasketballResultDto } from './update-match-result/basketball';
import { SoccerResultDto } from './update-match-result/soccer';
import { CyclingResultDto } from './update-match-result/cycling';
import { AthleticsResultDto } from './update-match-result/athletics';

export const SPORT_RESULT_DTOS: Record<string, any> = {
    volleyball: VolleyballResultDto,
    basketball: BasketballResultDto,
    soccer: SoccerResultDto,
    cycling: CyclingResultDto,
    athletics: AthleticsResultDto,
};
