import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  BadRequestException, Req,
} from '@nestjs/common';
import { TeamService } from './team.service';
import {JwtAuthGuard} from "../auth/auth.guard";
import {Types} from "mongoose";
import {IsTeamCaptain} from "./guards/is-team-captain";
import {ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Team} from "./team.schema";
import {UpdateTeamDto} from "./dto/update-team";

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team returned successfully.' })
  async findOne(@Param('id') id: string): Promise<Team> {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsTeamCaptain)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a team (only captain can update)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto, @Req() req) {
    return this.teamService.update(new Types.ObjectId(id), updateTeamDto, new Types.ObjectId(req.user.id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsTeamCaptain)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a team (only captain can delete)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
