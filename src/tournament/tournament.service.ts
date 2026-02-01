import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import { Tournament } from './tournament.schema';
import { Match } from '../match/match.schema';
import { Team } from '../team/team.schema';


@Injectable()
export class TournamentService {
  constructor(
  @InjectModel(Tournament.name)
  private readonly tournamentModel: Model<Tournament>,

  @InjectModel(Team.name)
  private readonly teamModel: Model<Team>,

  @InjectModel(Match.name)
  private readonly matchModel: Model<Match>,
) {}

  async findAll(sport?: string): Promise<Tournament[]> {
    return this.tournamentModel
        .find(sport ? { sport } : {})
        .populate('createdBy', 'name last_name email')  // popola il creator
        .populate('teams')                             // popola i team
        .populate('matches')                           // popola le partite
        .exec();
  }

  async findById(id: string): Promise<any> {
    const tournament = await this.tournamentModel
        .findById(id)
        .populate('createdBy', 'name last_name email')
        .populate('teams')
        .populate('matches')
        .exec();
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async create(data: any): Promise<Tournament> {
    try {
      const newTournament = new this.tournamentModel({
        ...data,
        createdBy: new Types.ObjectId(data.createdBy)
      });

      return newTournament.save();
    } catch (error) {
      throw new InternalServerErrorException(
          'Errore nella creazione del torneo',
          error.message,
      );
    }
  }

  async update(id: string, data: any): Promise<Tournament> {
    if (data.teams) data.teams = data.teams.map((id: string) => new Types.ObjectId(id));
    if (data.matches) data.matches = data.matches.map((id: string) => new Types.ObjectId(id));
    if (data.createdBy) data.createdBy = new Types.ObjectId(data.createdBy);

    const tournament = await this.tournamentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    await tournament.deleteOne();
  }



  async getStandings(tournamentId: string) {
    // 1. Recupera tutte le squadre del torneo
    const teams = await this.teamModel
      .find({ tournament: tournamentId })
      .select('name')
      .lean();

    // Mappa iniziale punteggi
    const standingsMap: Record<string, { teamName: string; points: number }> = {};

    teams.forEach(team => {
      standingsMap[team._id.toString()] = {
        teamName: team.name,
        points: 0,
      };
    });

    // 2. Recupera tutti i match completati
    const matches = await this.matchModel.find({
      tournament: tournamentId,
      status: 'completed',
    }).lean();

    // 3. Calcolo punteggi
    for (const match of matches) {
      const result = match.result;
      const teamIds = Object.keys(result);

      if (teamIds.length !== 2) continue; // sicurezza

      const [teamA, teamB] = teamIds;

      const scoreA = result[teamA].score;
      const scoreB = result[teamB].score;

      if (scoreA > scoreB) {
        standingsMap[teamA].points += 2;
      } else if (scoreA < scoreB) {
        standingsMap[teamB].points += 2;
      } else {
        standingsMap[teamA].points += 1;
        standingsMap[teamB].points += 1;
      }
    }

    // 4. Ordina la classifica
    return Object.values(standingsMap).sort(
      (a, b) => b.points - a.points,
    );
  }
}
