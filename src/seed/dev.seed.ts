import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TournamentService } from '../tournament/tournament.service';
import { SPORTS } from '../match/sports';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

@Injectable()
export class DevSeed implements OnModuleInit {
    private readonly logger = new Logger(DevSeed.name);
    private seededUserIds: string[] = [];
    private seededTournamentIds: string[] = [];

    constructor(
        private readonly userService: UserService,
        private readonly tournamentService: TournamentService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit() {
        if (this.configService.get('NODE_ENV') !== 'dev') {
            this.logger.log('❌ DevSeed disabilitato (NODE_ENV ≠ dev)');
            return;
        }

        this.logger.log('🌱 Avvio seeding di sviluppo...');

        // --- Admin ---
        let admin = await this.userService.findByEmail(
            this.configService.get('env.ADMIN_EMAIL') || 'admin@example.com',
        ).catch(() => null);

        if (!admin) {
            admin = await this.userService.create({
                type_user: 'admin',
                name: this.configService.get('env.ADMIN_NAME') || 'Admin',
                last_name: this.configService.get('env.ADMIN_LASTNAME') || 'User',
                email: this.configService.get('env.ADMIN_EMAIL') || 'admin@example.com',
                password: this.configService.get('env.ADMIN_PASSWORD') || 'password123',
                birthDate: new Date('1990-01-01'),
                gender: 'other',
            });
            this.logger.log(`✅ Admin creato: ${admin.email}`);
        } else {
            this.logger.log(`👑 Admin già presente: ${admin.email}`);
        }

        // --- Users e Tournaments ---
        await this.seedUsers();
        await this.seedTournaments(admin.id);

        // --- Cleanup listener ---
        process.on('SIGINT', async () => {
            await this.cleanUp();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.cleanUp();
            process.exit(0);
        });

        this.logger.log('🌿 Seeding completato.');
    }

    private async seedUsers() {
        const users: any[] = [];
        const password = 'devpass123';

        for (let i = 0; i < 40; i++) {
            const gender = faker.person.sexType();
            const name = faker.person.firstName(gender as 'male' | 'female');
            const lastName = faker.person.lastName(gender as 'male' | 'female');
            const email = faker.internet.email({ firstName: name, lastName, provider: 'example.com' });

            users.push({
                type_user: 'default',
                name,
                last_name: lastName,
                email: email.toLowerCase(),
                password: password,
                birthDate: faker.date.birthdate({ min: 1970, max: 2005, mode: 'year' }),
                gender,
            });
        }

        for (const data of users) {
            const created = await this.userService.create(data);
            this.seededUserIds.push(created.id.toString());
        }

        this.logger.log(`✅ Creati ${users.length} utenti demo`);
    }

    private async seedTournaments(adminId: string | Types.ObjectId) {
        const tournaments: any[] = [];

        for (const sportKey of Object.keys(SPORTS)) {
            for (let i = 1; i <= 2; i++) {
                tournaments.push({
                    name: `${SPORTS[sportKey].name} Tournament ${i}`,
                    description: `Torneo di ${SPORTS[sportKey].name} n°${i}`,
                    createdBy: adminId,
                    startDate: faker.date.soon({ days: 15 }),
                    endDate: faker.date.soon({ days: 30 }),
                    type: faker.helpers.arrayElement(['single_elimination', 'double_elimination', 'round_robin']),
                    sport: sportKey,
                });
            }
        }

        for (const t of tournaments) {
            const created = await this.tournamentService.create(t);
            this.seededTournamentIds.push(created.id.toString());
        }

        this.logger.log(`✅ Creati ${tournaments.length} tornei demo`);
    }

    private async cleanUp() {
        this.logger.log('🧹 Pulizia dati di sviluppo...');
        for (const id of this.seededTournamentIds) {
            try {
                await this.tournamentService.remove(id);
            } catch {}
        }
        for (const id of this.seededUserIds) {
            try {
                await this.userService.deleteDefinitely(id);
            } catch (err) {
                this.logger.warn(`Errore eliminando utente ${id}: ${err.message}`);
            }
        }
        this.logger.log('🧽 Dati di sviluppo rimossi.');
    }
}
