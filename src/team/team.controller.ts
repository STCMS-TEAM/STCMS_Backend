import { Controller, Get } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller()
export class TeamController {
  constructor(private readonly appService: TeamService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
