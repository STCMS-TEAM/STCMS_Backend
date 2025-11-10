import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {UserSeed} from "./user.seed";
import {TournamentModule} from "../tournament/tournament.module";

@Module({
  imports: [MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
  ]),
  TournamentModule,],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule]
})
export class UserModule {}
