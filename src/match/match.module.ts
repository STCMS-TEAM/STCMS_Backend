import {forwardRef, Module} from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Match, MatchSchema} from "./match.schema";
import {TournamentModule} from "../tournament/tournament.module";
import {TeamModule} from "../team/team.module";
import {UserModule} from "../user/user.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    forwardRef(() => TournamentModule),
    forwardRef(() => TeamModule),
    forwardRef(() => UserModule)],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService]
})
export class MatchModule {}
