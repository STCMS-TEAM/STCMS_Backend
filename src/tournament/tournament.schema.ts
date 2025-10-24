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

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }] })
    teams: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Match' }] })
    matches: Types.ObjectId[];

    @Prop({
        enum: ['upcoming', 'ongoing', 'finished'],
        default: 'upcoming',
    })
    status: string;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
