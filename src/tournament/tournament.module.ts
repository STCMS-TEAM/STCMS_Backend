import { Module } from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import {Tournament, TournamentSchema} from "./tournament.schema";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: Tournament.name, schema: TournamentSchema }])],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}
