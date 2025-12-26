import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date; // esplicito ma opzionale: Mongoose lo gestisce già

  @Prop({ type: String, required: true, maxlength: 50 })
  subject: string;

  @Prop({ type: String, required: true, maxlength: 1000 })
  description: string;

  @Prop({ type: String}) // you could store a URL, filename, or base64 string
  image: string;

  @Prop({ type: Number, default: 0, min: 0 })
  likes: number;
  
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: Types.ObjectId[];

}

export const BlogSchema = SchemaFactory.createForClass(Blog);
