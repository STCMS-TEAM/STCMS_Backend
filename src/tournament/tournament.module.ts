import {forwardRef, Module} from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import {Tournament, TournamentSchema} from "./tournament.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {TeamModule} from "../team/team.module";
import {MatchModule} from "../match/match.module";
import { Team, TeamSchema } from 'src/team/team.schema';
import { Match, MatchSchema } from 'src/match/match.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Team.name, schema: TeamSchema },]),
    forwardRef(() => TeamModule),
    forwardRef(() => MatchModule),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService]
})
export class TournamentModule {}
