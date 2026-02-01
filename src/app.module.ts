import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { TournamentModule } from './tournament/tournament.module';
import { TeamModule } from './team/team.module';
import { MatchModule } from './match/match.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfig from './config/env.config';
import { TestModule } from './test/test.module';
import { AuthModule } from './auth/auth.module';
import { DevSeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('env.MONGO_URI');
        console.log('Mongo URI:', uri); // debug
        return {
          uri,
          autoIndex: true,
        };
      },
      inject: [ConfigService],
    }),

    UserModule,
    AuthModule,
    TournamentModule,
    TeamModule,
    MatchModule,
    ...(process.env.NODE_ENV === 'dev' ? [DevSeedModule] : []),
    //TestModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
