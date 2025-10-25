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

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':id')
  async findOne(
      @Param('id') id: string,
  ) {
    return this.teamService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, IsTeamCaptain)
  @Patch(':id')
  async update(
      @Param('id') id: string,
      @Body() updateTeamDto: any,
      @Req() req
  ) {
    return this.teamService.update(new Types.ObjectId(id), updateTeamDto, new Types.ObjectId(req.user.id));
  }

  @UseGuards(JwtAuthGuard, IsTeamCaptain)
  @Delete(':id')
  async remove(
      @Param('id') id: string,
  ) {
    return this.teamService.remove(id);
  }
}
