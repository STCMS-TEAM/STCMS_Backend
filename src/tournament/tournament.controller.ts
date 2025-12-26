import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from './tournament.schema';
import {JwtAuthGuard} from "../auth/auth.guard";
import {CreateTournamentDto} from "./dto/create-tournament";
import {IsTournamentCreatorGuard} from "./guards/is-tournament-creator";
import {CreateTeamDto} from "../team/dto/create-team";
import {Types} from "mongoose";
import {TeamService} from "../team/team.service";
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UpdateTournamentDto} from "./dto/update-tournament";
import {MatchService} from "../match/match.service";
import {CreateMatchDto} from "../match/dto/create-match";
import { MatchesQueryDto } from '../match/dto/filterbydate-match.dto';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(
      private readonly tournamentService: TournamentService,
      private readonly teamService: TeamService,
      private readonly matchService: MatchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tournaments' })
  @ApiResponse({ status: 200, description: 'List of tournaments returned successfully.' })
  @ApiQuery({ name: 'sport', required: false, type: String, description: 'Filter tournaments by sport' })
  async getAll(@Query('sport') sport?: string): Promise<Tournament[]> {
    return this.tournamentService.findAll(sport);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ status: 200, description: 'Tournament returned successfully.' })
  async getOne(@Param('id') id: string): Promise<Tournament> {
    return this.tournamentService.findById(id);
  }

  @Get(':id/teams')
  @ApiOperation({ summary: 'Get all teams in a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ status: 200, description: 'List of teams returned successfully.' })
  async findAll(@Param('id') tournamentId: string) {
    return this.teamService.findAllByTournament(tournamentId);
  }
/*
  @Get(':id/matches')
  @ApiOperation({ summary: 'Get all matches of a tournaments' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter matches by status' })
  async findAllByTournament(@Param('id') tournamentId: string, @Query('status') status?: string) {
    return this.matchService.getMatchesByTournament(tournamentId, status);
  }
*/

@Get(':id/matches')
@ApiOperation({ summary: 'Get all matches of a tournaments filtered by date/time interval' })
@ApiParam({ name: 'id', type: String, description: 'Turnament ID' })
@ApiQuery({
  name: 'fromDateTime',
  type: String,
  required: false,
  description: 'Date/time ISO 8601 from (es: 2025-11-19T10:00:00Z)'
})
@ApiQuery({
  name: 'toDateTime',
  type: String,
  required: false,
  description: 'Date/time ISO 8601 to (es: 2025-11-19T12:00:00Z)'
})
@ApiQuery({
  name: 'status',
  type: String,
  required: false,
  description: 'Filter of the match by state'
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
async findAllByTournamentAndDate(
  @Param('id') tournamentId: string,
  @Query() query: MatchesQueryDto,
) {


  if (query.fromDateTime && query.toDateTime && query.fromDateTime > query.toDateTime) {
    throw new BadRequestException('fromDateTime can not be more then toDateTime');
  }

  return this.matchService.getMatchesByTournamentAndDate(
    tournamentId,
    query.fromDateTime,
    query.toDateTime,
    query.status,
  );
}



  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, description: 'Tournament created successfully.' })
  async create(@Body() body: CreateTournamentDto, @Req() req): Promise<Tournament> {
    const userId = req.user.id;
    return this.tournamentService.create({ ...body, createdBy: userId });
  }

  @Post(':tournamentId/teams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team in a tournament' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament ID' })
  @ApiResponse({ status: 201, description: 'Team created successfully.' })
  async createTeam(
      @Param('tournamentId') tournamentId: string,
      @Body() createTeamDto: CreateTeamDto,
      @Req() req,
  ) {
    try {
      return await this.teamService.create(
          createTeamDto,
          new Types.ObjectId(tournamentId),
          new Types.ObjectId(req.user.id),
      );
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('A team with this name is already in the tournament');
      }
      throw error;
    }
  }

  @Post(':id/matches')
  //@UseGuards(JwtAuthGuard, IsTournamentCreatorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new match for a turnament' })
  @ApiParam({ name: 'tournamentId', type: String })
  @ApiResponse({ status: 201, description: 'Match created with succes' })
  @ApiResponse({ status: 404, description: 'Torneo not found' })
  async createMatch(
      @Param('id') tournamentId: string,
      @Body() dto: CreateMatchDto,
  ) {
    if (!dto.teams || dto.teams.length < 2) {
      throw new BadRequestException('We need at least 2 team');
    }
    const teams = dto.teams.map((t) => new Types.ObjectId(t));
    return this.matchService.createMatch(tournamentId, teams, dto.startDate);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsTournamentCreatorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ status: 200, description: 'Tournament updated successfully.' })
  async update(@Param('id') id: string, @Body() body: UpdateTournamentDto): Promise<Tournament> {
    return this.tournamentService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsTournamentCreatorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ status: 200, description: 'Tournament deleted successfully.' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.tournamentService.remove(id);
    return { message: 'Tournament deleted successfully' };
  }
}
