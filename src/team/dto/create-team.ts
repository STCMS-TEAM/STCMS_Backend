import { IsMongoId, IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    players: Types.ObjectId[];
}
