import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {SPORTS, SportType} from "../match/sports";

@Schema({ timestamps: true })
export class Tournament extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({
        enum: ['single_elimination', 'double_elimination', 'round_robin'],
        default: 'single_elimination',
    })
    type: string;

    @Prop({
        type: String,
        required: true,
        enum: Object.keys(SPORTS),
    })
    sport: SportType;

}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.virtual('teams', {
    ref: 'Team',
    localField: '_id',
    foreignField: 'tournament'
});

TournamentSchema.virtual('matches', {
    ref: 'Match',
    localField: '_id',
    foreignField: 'tournament'
});

// Abilita `virtuals` nel toJSON / toObject
TournamentSchema.set('toJSON', { virtuals: true });
TournamentSchema.set('toObject', { virtuals: true });

TournamentSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const tournamentId = this._id;
        const db = (this.constructor as any).db;

        const matchModel = db.models.Match;
        const teamModel = db.models.Team;

        if (matchModel) {
            const res = await matchModel.deleteMany({ tournament: tournamentId });
        }

        if (teamModel) {
            const res = await teamModel.deleteMany({ tournament: tournamentId });
        }

        next();
    } catch (err) {
        next(err);
    }
});


