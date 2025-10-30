import {forwardRef, Module} from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Match, MatchSchema} from "./match.schema";
import {TournamentModule} from "../tournament/tournament.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    forwardRef(() => TournamentModule)],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService]
})
export class MatchModule {}
