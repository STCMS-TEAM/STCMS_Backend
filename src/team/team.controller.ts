import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team';
import {JwtAuthGuard} from "../auth/auth.guard";
import {Types} from "mongoose";

@Controller('tournaments/:tournamentId/teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
      @Param('tournamentId') tournamentId: string,
      @Body() createTeamDto: CreateTeamDto,
  ) {
    try {
      return await this.teamService.create(
        createTeamDto,
        new (require('mongoose').Types.ObjectId)(tournamentId)
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

  @Get()
  async findAll(@Param('tournamentId') tournamentId: string) {
    return this.teamService.findAllByTournament(tournamentId);
  }

  @Get(':id')
  async findOne(
      @Param('tournamentId') tournamentId: string,
      @Param('id') id: string,
  ) {
    return this.teamService.findOne(tournamentId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
      @Param('tournamentId') tournamentId: string,
      @Param('id') id: string,
      @Body() updateTeamDto: any,
  ) {
    return this.teamService.update(new Types.ObjectId(id), updateTeamDto, new Types.ObjectId(tournamentId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
      @Param('tournamentId') tournamentId: string,
      @Param('id') id: string,
  ) {
    return this.teamService.remove(tournamentId, id);
  }
}
