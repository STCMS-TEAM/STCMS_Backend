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

TournamentSchema.pre('deleteOne', { document: true, query: false }, async function() {
    const tournamentId = this._id;
    const tournamentModel = this.constructor as any;

    // Elimina tutti i team del torneo
    const teamResult = await tournamentModel.db.model('Team').deleteMany({
        tournament: tournamentId
    });

    // Elimina tutte le partite del torneo
    const matchResult = await tournamentModel.db.model('Match').deleteMany({
        tournament: tournamentId
    });
});
