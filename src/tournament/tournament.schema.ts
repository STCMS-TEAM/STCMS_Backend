import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
