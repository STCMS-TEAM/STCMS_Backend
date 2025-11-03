import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsMongoId } from 'class-validator';

export class CreateMatchDto {
    @ApiProperty({
        description: 'Lista di squadre partecipanti (ObjectId delle squadre)',
        type: [String],
        example: ['64f1c5b3f7e7d5b1b8c9d123', '64f1c5b3f7e7d5b1b8c9d456'],
    })
    @IsArray()
    @ArrayMinSize(2)
    @IsMongoId({ each: true })
    teams: string[];
}
