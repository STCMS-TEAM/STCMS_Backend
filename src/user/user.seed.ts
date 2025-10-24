import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from './user.schema';

@Injectable()
export class UserSeed implements OnModuleInit {
    private readonly logger = new Logger(UserSeed.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private configService: ConfigService,
    ) {}

    async onModuleInit() {
        const existingAdmin = await this.userModel.findOne({ type_user: 'admin' });
        if (existingAdmin) {
            this.logger.log(`Admin user already exists: ${existingAdmin.email}`);
            return;
        }

        const admin = await this.userModel.create({
            type_user: 'admin',
            name: this.configService.get('env.ADMIN_NAME'),
            last_name: this.configService.get('env.ADMIN_LASTNAME'),
            email: this.configService.get('env.ADMIN_EMAIL'),
            password: this.configService.get('env.ADMIN_PASSWORD'),
            gender: 'other',
        });

        this.logger.log(`🚀 Default admin created: ${admin.email}`);
    }
}
