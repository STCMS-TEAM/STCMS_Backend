import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  NotFoundException, UsePipes, BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UpdateMatchStatusDto } from './dto/update-match-status';
import {
  ApiBearerAuth, ApiBody, ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags, getSchemaPath,
} from '@nestjs/swagger';
import { Match } from './match.schema';
import {SPORT_RESULT_DTOS} from "./dto/update-match-result";
import {plainToInstance} from "class-transformer";
import {validateSync} from "class-validator";
import {SPORTS} from "./sports";

@ApiTags('Matches')
/*@ApiExtraModels(
    VolleyballResultDto,
    BasketballResultDto,
    SoccerResultDto,
    CyclingResultDto,
    AthleticsResultDto,
)*/
@ApiExtraModels(...Object.values(SPORT_RESULT_DTOS))
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // ------------------------------------------------------
  // GET /matches/:id
  // ------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get a match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match returned successfully.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  async findOne(@Param('id') id: string): Promise<Match> {
    const match = await this.matchService.getMatchById(id);
    if (!match) throw new NotFoundException('Match non trovato');
    return match;
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get a match result by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Result returned successfully.' })
  @ApiResponse({ status: 404, description: 'Result not found.' })
  async findResult(@Param('id') id: string): Promise<any> {
    return this.matchService.getMatchResult(id);
  }

  // ------------------------------------------------------
  // PATCH /matches/:id/result
  // ------------------------------------------------------
  @Patch(':id/result')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match result (auto-validates by sport)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match result updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid format or wrong sport data.' })
  @ApiBody({
    schema: {
      oneOf: Object.entries(SPORT_RESULT_DTOS).map(([sport, dto]) => ({
        $ref: getSchemaPath(dto),
        description: `Formato risultato per ${sport}`,
      })),
    },
  })
  async updateResult(@Param('id') id: string, @Body() body: any) {
    const match = await this.matchService.getMatchSport(id);
    // @ts-ignore
    const sport = match.tournament?.sport;
    if(!sport) throw new BadRequestException(`Unsupported sport: ${sport}`);

    const Dto = SPORT_RESULT_DTOS[sport];
    if (!Dto) throw new BadRequestException(`Unsupported sport: ${sport}`);

    const resultType = SPORTS[sport].resultType;

    const dtoObj = plainToInstance(Dto, body);
    const errors = validateSync(dtoObj, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) throw new BadRequestException(errors);

    switch (resultType) {
      case 'score':
        return this.matchService.updateScoreResult(match, dtoObj);

      case 'ranking':
        return this.matchService.updateRankingResult(match, dtoObj);

      default:
        throw new BadRequestException(`Unsupported result type: ${resultType}`);
    }
  }

  // ------------------------------------------------------
  // PATCH /matches/:id/status
  // ------------------------------------------------------
  @Patch(':id/status')
  //@UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update match status (requires authentication)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match status updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid status value.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  async updateStatus(
      @Param('id') id: string,
      @Body() dto: UpdateMatchStatusDto,
      @Req() req,
  ): Promise<Match> {
    return this.matchService.updateStatus(id, dto.status);
  }

  // ------------------------------------------------------
  // DELETE /matches/:id
  // ------------------------------------------------------
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a match (requires authentication)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Match not found.' })
  async remove(@Param('id') id: string) {
    const deleted = await this.matchService.deleteMatch(id);
    if (!deleted) throw new NotFoundException('Match non trovato');
    return { message: 'Match eliminato con successo' };
  }
}
