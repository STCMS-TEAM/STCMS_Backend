import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament } from './tournament.schema';

@Injectable()
export class TournamentService {
  constructor(@InjectModel(Tournament.name) private readonly tournamentModel: Model<Tournament>) {}

  async findAll(): Promise<Tournament[]> {
    return this.tournamentModel
        .find()
        .populate('createdBy', 'name last_name email')  // popola il creator
        .populate('teams')                             // popola i team
        .populate('matches')                           // popola le partite
        .exec();
  }

  async findById(id: string): Promise<Tournament> {
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
    const newTournament = new this.tournamentModel({
      ...data,
      createdBy: new Types.ObjectId(data.createdBy),
      teams: data.teams?.map((id: string) => new Types.ObjectId(id)) || [],
      matches: data.matches?.map((id: string) => new Types.ObjectId(id)) || [],
    });
    return newTournament.save();
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
    const result = await this.tournamentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Tournament not found');
  }
}
