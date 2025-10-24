import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ enum: ['admin', 'default'], default: 'default' })
    type_user: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    last_name: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ required: true, minlength: 6 })
    password: string;

    @Prop({ enum: ['male', 'female', 'other'] })
    gender: string;

    @Prop()
    phone_number: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Tournament' }] })
    tournamentsCreated: Types.ObjectId[];

    matchPassword: Function;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};
