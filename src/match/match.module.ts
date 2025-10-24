import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Match, MatchSchema} from "./match.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }])],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
