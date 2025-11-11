import {Injectable, Logger, OnApplicationShutdown, OnModuleInit} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TournamentService } from '../tournament/tournament.service';
import { SPORTS } from '../match/sports';
import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';
import {MatchService} from "../match/match.service";
import {TeamService} from "../team/team.service";

@Injectable()
export class DevSeed implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(DevSeed.name);
    private seededUserIds: string[] = [];
    private seededTournamentIds: any[] = [];

    constructor(
        private readonly userService: UserService,
        private readonly tournamentService: TournamentService,
        private readonly teamService: TeamService,
        private readonly matchService: MatchService,
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

        await this.seed();

        // --- Cleanup listener ---
        process.on('SIGINT', async () => {
            this.logger.log('📴 Ricevuto SIGINT, chiusura applicazione...');
            await this.onApplicationShutdown('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            this.logger.log('📴 Ricevuto SIGTERM, chiusura applicazione...');
            await this.onApplicationShutdown('SIGTERM');
            process.exit(0);
        });

        this.logger.log('🌿 Seeding completato.');
    }

    private async seed() {
        // 1️⃣ Crea utenti se non esistono
        const existingUsers = await this.userService.findAll();
        if (existingUsers.length >= 40) {
            this.logger.log('👥 Utenti già presenti, salto creazione.');
            this.seededUserIds = existingUsers.map(u => u.id.toString());
        } else {
            const password = 'password123';
            const genders = ['male', 'female', 'other'];

            for (let i = 1; i <= 40; i++) {
                const user = await this.userService.create({
                    name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password,
                    birthDate: faker.date.birthdate({ min: 1980, max: 2005, mode: 'year' }),
                    gender: faker.helpers.arrayElement(genders),
                });

                this.seededUserIds.push(user.id.toString());
            }

            this.logger.log(`👤 Creati ${this.seededUserIds.length} utenti.`);
        }

        // 2️⃣ Recupera admin
        const allUsers = await this.userService.findAll();
        const admin = allUsers.find(u => u.type_user === 'admin');
        if (!admin) {
            this.logger.error('❌ Nessun admin trovato! Esegui prima UserSeed.');
            return;
        }

        // 3️⃣ Crea tornei e team per ogni sport
        const sportKeys = Object.keys(SPORTS);
        for (const sport of sportKeys) {
            for (let t = 1; t <= 2; t++) {
                const tournament = await this.tournamentService.create({
                    name: `${sport} Tournament ${t}`,
                    sport,
                    createdBy: admin._id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                    type: 'single_elimination',
                });
                this.seededTournamentIds.push(tournament.id.toString());
                this.logger.log(`🏆 Creato torneo: ${tournament.name}`);

                // 4️⃣ Crea squadre
                const usersCopy = [...this.seededUserIds];
                this.shuffleArray(usersCopy);
                const TEAMS_PER_TOURNAMENT = Math.floor(usersCopy.length / 4);
                const teams: any[] = [];

                for (let i = 0; i < TEAMS_PER_TOURNAMENT; i++) {
                    const teamMembers = usersCopy.splice(0, 4);
                    if (teamMembers.length < 4) break;

                    const captainId = new Types.ObjectId(teamMembers[0]);
                    const playerEmails = await Promise.all(
                        teamMembers.map(async id => {
                            const u = await this.userService.findById(id);
                            return u.email;
                        })
                    );

                    try {
                        const team = await this.teamService.create(
                            {
                                name: `${sport}_Team_${t}_${i + 1}`,
                                players: playerEmails,
                            },
                            new Types.ObjectId(tournament.id),
                            captainId,
                        );

                        teams.push(team);
                    } catch (err) {
                        this.logger.warn(`⚠️ Errore creazione team ${i + 1} (${err.message})`);
                    }
                }

                this.logger.log(`👥 Creati ${teams.length} team per ${tournament.name}`);

                // 5️⃣ Crea match a coppie
                for (let i = 0; i < teams.length; i += 2) {
                    if (i + 1 >= teams.length) break;
                    try {
                        const match = await this.matchService.createMatch(
                            tournament.id.toString(),
                            [teams[i]._id, teams[i + 1]._id],
                            new Date().toString(),
                        );
                    } catch (err) {
                        this.logger.warn(`⚠️ Errore creazione match ${i / 2 + 1} (${err.message})`);
                    }
                }

                this.logger.log(`⚔️ Creati ${Math.floor(teams.length / 2)} match per ${tournament.name}`);
            }
        }
    }

    private shuffleArray<T>(array: T[]): T[] {
            return [...array].sort(() => Math.random() - 0.5);
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

    async onApplicationShutdown(signal?: string) {
        if (signal) this.logger.log(`📴 Chiusura app con segnale ${signal}`);
        this.logger.log('🧹 Pulizia dati di sviluppo in corso...');
        await this.cleanUp();
        this.logger.log('✅ Pulizia completata.');
    }
}
