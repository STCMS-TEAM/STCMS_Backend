import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Match extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
    tournament: Types.ObjectId;

    @Prop({
        type: [
            {
                player: { type: Types.ObjectId, ref: 'Team' },
                points: Number,
            },
        ],
    })
    score: { player: Types.ObjectId; points: number }[];

    @Prop({ type: Types.ObjectId, ref: 'Team' })
    winner: Types.ObjectId;

    @Prop({ enum: ['pending', 'completed'], default: 'pending' })
    status: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
