import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './team.schema';
import { CreateTeamDto } from './dto/create-team';
import {UserService} from "../user/user.service";

@Injectable()
export class TeamService {
  constructor(
      @InjectModel(Team.name)
      private readonly teamModel: Model<Team>,
      private readonly userService: UserService,
  ) {}

  async create(createTeamDto: CreateTeamDto, tournament: Types.ObjectId, captainId: Types.ObjectId): Promise<Team> {
    const { players, name } = createTeamDto;

    const uniqPlayers = Array.from(new Set(players.map(p => p.toString())));
    if (uniqPlayers.length !== players.length) {
      throw new BadRequestException('Uno stesso giocatore è stato inserito più volte nella squadra');
    }

    try {
      await Promise.all(players.map(id => this.userService.findById(id.toString())));
    } catch (err) {
      throw new BadRequestException('Alcuni giocatori inseriti non esistono');
    }

    if (!players.map(p => p.toString()).includes(captainId.toString())) {
      players.push(captainId);
    }

    const existingTeams = await this.teamModel.find({
      tournament,
      players: { $in: players },
    });

    if (existingTeams.length > 0) {
      const playersInConflict = existingTeams
          .flatMap(t => t.players.map(p => p.toString()))
          .filter(p => players.map(pl => pl.toString()).includes(p));
      throw new BadRequestException(
          `Alcuni giocatori sono già iscritti in altre squadre di questo torneo: ${playersInConflict.join(', ')}`,
      );
    }

    try {
      const team = new this.teamModel({...createTeamDto, tournament, captain: captainId});
      return await team.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Un team con questo nome esiste già in questo torneo');
      }
      throw error;
    }
  }

  // 🔹 GET ALL
  async findAllByTournament(tournamentId: string): Promise<Team[]> {
    if (!Types.ObjectId.isValid(tournamentId)) return [];
    return this.teamModel.find({ tournament: new Types.ObjectId(tournamentId) }).exec();
  }

  // 🔹 GET ONE
  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel
        .findOne({ _id: new Types.ObjectId(id) })
        .populate('players', 'name email')
        .exec();

    if (!team) throw new NotFoundException('Team non trovato');
    return team;
  }

  // 🔹 UPDATE
  async update(id: Types.ObjectId, updateDto: any, captainId: Types.ObjectId): Promise<Team> {
    const { players } = updateDto;

    const existingTeam = await this.teamModel.findById(id);
    if (!existingTeam) throw new NotFoundException('Team non trovato');
    const tournament = existingTeam.tournament;

    if (!players.map(p => p.toString()).includes(captainId.toString())) {
      players.push(captainId);
    }

    if (players && players.length > 0) {
      const uniqPlayers = Array.from(new Set(players.map(p => p.toString())));
      if (uniqPlayers.length !== players.length) {
        throw new BadRequestException('Uno stesso giocatore è stato inserito più volte nella squadra');
      }

      const conflictTeams = await this.teamModel.find({
        tournament,
        _id: { $ne: id },
        players: { $in: players },
      });

      if (conflictTeams.length > 0) {
        const playersInConflict = conflictTeams
            .flatMap(t => t.players.map(p => p.toString()))
            .filter(p => players.map(pl => pl.toString()).includes(p));
        throw new BadRequestException(
            `Alcuni giocatori sono già iscritti in altre squadre di questo torneo: ${playersInConflict.join(', ')}`,
        );
      }
    }

    try {
      const team = await this.teamModel.findOneAndUpdate(
          { _id: id, tournament },
          updateDto,
          { new: true },
      );

      if (!team) throw new NotFoundException('Team non trovato');
      return team;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Un team con questo nome esiste già in questo torneo');
      }
      throw error;
    }
  }


  async remove(id: string): Promise<{ message: string }> {
    const res = await this.teamModel.deleteOne({
      _id: new Types.ObjectId(id)
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Team non trovato');
    }

    return { message: 'Team eliminato con successo' };
  }
}
