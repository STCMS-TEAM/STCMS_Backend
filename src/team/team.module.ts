import {forwardRef, Module} from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import {Team, TeamSchema} from "./team.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {UserModule} from "../user/user.module";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    forwardRef(() => UserModule)
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService]
})
export class TeamModule {}
