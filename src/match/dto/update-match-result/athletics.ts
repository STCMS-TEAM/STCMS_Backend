import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AthleticsEntryDto {
    @ApiProperty({ example: 'user123' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 9.85, description: 'Tempo in secondi' })
    @IsNumber()
    time: number;
}

export class AthleticsResultDto {
    @ApiProperty({
        type: [AthleticsEntryDto],
        description: 'Classifica ordinata per tempo',
    })
    @ValidateNested({ each: true })
    @Type(() => AthleticsEntryDto)
    @IsArray()
    ranking: AthleticsEntryDto[];
}
