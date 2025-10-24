// src/test/test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';

@Controller('test')
export class TestController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Get()
  async testConnection() {
    try {
      const count = await this.userModel.countDocuments();
      return {
        message: '✅ Connessione a MongoDB riuscita!',
        usersCount: count,
      };
    } catch (err) {
      return {
        message: '❌ Errore nella connessione o nel modello',
        error: err.message,
      };
    }
  }
}
