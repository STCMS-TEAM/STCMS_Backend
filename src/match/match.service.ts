import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Match} from "./match.schema";
import {TournamentService} from "../tournament/tournament.service";
import {SPORTS} from "./sports";
import {TeamService} from "../team/team.service";
import {UserService} from "../user/user.service";

@Injectable()
export class MatchService {
  constructor(@InjectModel(Match.name) private readonly matchModel: Model<Match>, private readonly tournamentService: TournamentService, private readonly teamService: TeamService, private readonly userService: UserService) {}

  async createMatch(tournamentId: string, teams: Types.ObjectId[]) {
    const tournament = await this.tournamentService.findById(tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');

    const tournamentTeamIds = tournament.teams.map(t => t._id.toString());
    const invalidTeams = teams.filter(t => !tournamentTeamIds.includes(t.toString()));
    if (invalidTeams.length > 0) {
      throw new BadRequestException('Alcune squadre non appartengono a questo torneo');
    }

    const sportConfig = SPORTS[tournament.sport];
    if (!sportConfig) throw new BadRequestException(`Unsupported sport: ${tournament.sport}`);

    const result = sportConfig.createDefaultResult(teams.map(t => t.toString()));

    const match = new this.matchModel({
      tournament: tournamentId,
      teams,
      result,
    });

    return match.save();
  }

  /**
   * Ritorna tutte le partite di un torneo
   */
  async getMatchesByTournament(tournamentId: string) {
    return this.matchModel
        .find({ tournament: tournamentId })
        .populate('teams')
        .populate('tournament')
        .exec();
  }

  async getMatchSport(matchId: string) {
    const match = await this.matchModel
        .findById(matchId)
        .populate('tournament', 'sport')
        .exec();

    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  /**
   * Ritorna un match singolo
   */
  async getMatchById(matchId: string) {
    const match = await this.matchModel
        .findById(matchId)
        .populate('tournament')
        .populate('teams')
        .exec();
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async getMatchResult(matchId: string) {
    const match = await this.matchModel
        .findById(matchId)
        .exec();
    if (!match) throw new NotFoundException('Match not found');
    if ('score' in match.result) return this.getMatchScore(match);
    if ('ranking' in match.result) return this.getRankingScore(match);
    return match.result;
  }

  private getMatchScore(match: Match) {
    // @ts-ignore
    return Promise.all(Object.entries(match.result.score).map(async ([key, value]) => {
      const team = await this.teamService.getEssential(key);
      return {...team, score: value};
    }));
  }

  private async getRankingScore(match: Match) {
    // @ts-ignore
    return await Promise.all(match.result.ranking.map(async rank => {
      const { userId, ...rest} = rank;
      let user = await this.userService.getUserEssential(userId);
      return {...user, ...rest};
    }));
  }

  async updateScoreResult(match: Match, result: any) {
    if (!result?.score || typeof result.score !== 'object') {
      throw new BadRequestException('Invalid score format');
    }

    // Aggiorna solo i team esistenti
    const updatedScore: Record<string, number> = {};
    for (const teamId of match.teams.map(t => t.toString())) {
      updatedScore[teamId] = result.score[teamId] ?? 0;
    }

    match.result = { score: updatedScore };
    return match.save();
  }

  async updateRankingResult(match: Match, result: any) {
    if (!Array.isArray(result?.ranking)) {
      throw new BadRequestException('Invalid ranking format: must be an array');
    }
    const teamsPlayers =  (await Promise.all(match.teams.map(async teamId => await this.teamService.findOne(teamId.toString())))).map(team => team.players).flat();
    const bSet = new Set(teamsPlayers.map(x => x._id.toString()));
    const allIncluded = result.ranking.every(x => bSet.has(x.userId));
    if(!allIncluded) throw new BadRequestException('Invalid ranking format: every player must be in a subscribed team');

    match.result = { ranking: result.ranking };
    return match.save();
  }


  /**
   * Aggiorna lo stato (pending/live/completed)
   */
  async updateStatus(matchId: string, status: 'pending' | 'live' | 'completed') {
    const match = await this.matchModel.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    match.status = status;
    return await match.save();
  }

  /**
   * Elimina una partita
   */
  async deleteMatch(matchId: string) {
    const match = await this.matchModel.findByIdAndDelete(matchId);
    if (!match) throw new NotFoundException('Match not found');
    return { message: 'Match deleted successfully' };
  }
}
