import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CyclingEntryDto {
    @ApiProperty({ example: '665a9f3dc2a8ab0012345678' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 3600, description: 'Tempo in secondi' })
    @IsNumber()
    time: number;
}

export class CyclingResultDto {
    @ApiProperty({
        type: [CyclingEntryDto],
        description: 'Classifica dei partecipanti con i rispettivi tempi',
    })
    @ValidateNested({ each: true })
    @Type(() => CyclingEntryDto)
    @IsArray()
    ranking: CyclingEntryDto[];
}
