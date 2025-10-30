import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { SPORTS, SportType } from './sports';

@Schema({ timestamps: true })
export class Match extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
    tournament: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }] })
    teams: Types.ObjectId[];

    @Prop({ enum: ['pending', 'live', 'completed'], default: 'pending' })
    status: string;

    @Prop({ type: Object, default: {} })
    result: any;
}

export const MatchSchema = SchemaFactory.createForClass(Match);


MatchSchema.pre('save', async function (next) {
    // Se non è una nuova partita o il result è già impostato, non fare nulla
    if (!this.isNew || (this.result && Object.keys(this.result).length > 0)) return next();

    try {
        const tournament = await (this as any).model('Tournament').findById(this.tournament).exec();
        if (!tournament) return next(new Error(`Tournament not found: ${this.tournament}`));

        const sportConfig = SPORTS[tournament.sport];
        if (!sportConfig) return next(new Error(`Unsupported sport: ${tournament.sport}`));

        // Se lo sport ha una funzione per creare il risultato di default
        if (typeof sportConfig.createDefaultResult === 'function') {
            this.result = sportConfig.createDefaultResult(this.teams.map(t => t.toString()));
        } else {
            this.result = { ...sportConfig.defaultResult };
        }

        next();
    } catch (err) {
        next(err);
    }
});
