import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DevSeed } from './dev.seed';
import {UserModule} from "../user/user.module";
import {TournamentModule} from "../tournament/tournament.module";
import {TeamModule} from "../team/team.module";
import {MatchModule} from "../match/match.module";

@Module({
    imports: [
        ConfigModule, UserModule, TournamentModule, TeamModule, MatchModule
    ],
    providers: [DevSeed],
})
export class DevSeedModule {}
