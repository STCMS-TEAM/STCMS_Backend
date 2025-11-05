import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CyclingEntryDto {
    @ApiProperty({ example: 'user123' })
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
