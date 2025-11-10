import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DevSeed } from './dev.seed';
import {UserModule} from "../user/user.module";
import {TournamentModule} from "../tournament/tournament.module";

@Module({
    imports: [
        ConfigModule, UserModule, TournamentModule,
    ],
    providers: [DevSeed],
})
export class DevSeedModule {}
