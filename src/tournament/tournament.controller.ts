import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from './tournament.schema';
import {JwtAuthGuard} from "../auth/auth.guard";
import {CreateTournamentDto} from "./dto/create-tournament";
import {IsCreatorGuard} from "./guards/is-creator";

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get()
  async getAll(): Promise<Tournament[]> {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Tournament> {
    return this.tournamentService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateTournamentDto, @Req() req): Promise<Tournament> {
    const userId = req.user.id;
    return this.tournamentService.create({ ...body, createdBy: userId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsCreatorGuard)
  async update(@Param('id') id: string, @Body() body: any): Promise<Tournament> {
    return this.tournamentService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsCreatorGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.tournamentService.remove(id);
    return { message: 'Tournament deleted successfully' };
  }
}
