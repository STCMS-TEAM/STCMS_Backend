import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Team extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
    tournament: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User', required: true }] })
    players: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);

TeamSchema.index({ name: 1, tournament: 1 }, { unique: true });
