import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
    @ApiProperty({ description: 'Lista di squadre (ObjectId)' })
    @IsArray()
    @ArrayMinSize(2)
    @IsMongoId({ each: true })
    teams: string[];
}
