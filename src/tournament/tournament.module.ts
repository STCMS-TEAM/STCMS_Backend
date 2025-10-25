import {forwardRef, Module} from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import {Tournament, TournamentSchema} from "./tournament.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {TeamModule} from "../team/team.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }]),
    forwardRef(() => TeamModule),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService]
})
export class TournamentModule {}
