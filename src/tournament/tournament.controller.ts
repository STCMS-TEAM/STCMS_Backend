import {BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from './tournament.schema';
import {JwtAuthGuard} from "../auth/auth.guard";
import {CreateTournamentDto} from "./dto/create-tournament";
import {IsTournamentCreatorGuard} from "./guards/is-tournament-creator";
import {CreateTeamDto} from "../team/dto/create-team";
import {Types} from "mongoose";
import {TeamService} from "../team/team.service";

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService, private readonly teamService: TeamService) {}

  @Get()
  async getAll(): Promise<Tournament[]> {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Tournament> {
    return this.tournamentService.findById(id);
  }

  @Get(':tournamentId/teams')
  async findAll(@Param('tournamentId') tournamentId: string) {
    return this.teamService.findAllByTournament(tournamentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateTournamentDto, @Req() req): Promise<Tournament> {
    const userId = req.user.id;
    return this.tournamentService.create({ ...body, createdBy: userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':tournamentId/teams')
  async createTeam(
      @Param('tournamentId') tournamentId: string,
      @Body() createTeamDto: CreateTeamDto,
      @Req() req
  ) {
    try {
      return await this.teamService.create(
          createTeamDto,
          new Types.ObjectId(tournamentId),
          new Types.ObjectId(req.user.id)
      );
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
            'Un team con questo nome esiste già in questo torneo',
        );
      }
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsTournamentCreatorGuard)
  async update(@Param('id') id: string, @Body() body: any): Promise<Tournament> {
    return this.tournamentService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsTournamentCreatorGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.tournamentService.remove(id);
    return { message: 'Tournament deleted successfully' };
  }

}
