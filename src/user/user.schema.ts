import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, Model, Query, Types} from 'mongoose';
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

UserSchema.virtual('tournamentsCreated', {
    ref: 'Tournament',       // modello di riferimento
    localField: '_id',        // campo locale (id dell'utente)
    foreignField: 'createdBy' // campo nel torneo che punta all'utente
});

UserSchema.virtual('teams', {
    ref: 'Team',
    localField: '_id',
    foreignField: 'players',
});

// Abilita `virtuals` nel toJSON / toObject
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });


UserSchema.pre('deleteOne', { document: true, query: false }, async function() {
    const userId = this._id;

    const tournaments = await this.model('Tournament').find({ createdBy: userId });
    for (const tournament of tournaments) {
        await tournament.deleteOne();
    }

    await this.model('Team').updateMany(
        { captain: userId },
        { $unset: { captain: "" } }
    );

    await this.model('Team').updateMany(
        { players: userId },
        { $pull: { players: userId } }
    );
});
