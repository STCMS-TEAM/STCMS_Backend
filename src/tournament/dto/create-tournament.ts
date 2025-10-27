import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTournamentDto {
    @ApiProperty({ example: 'Campionato 2025', description: 'Nome del torneo' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Torneo di prova', description: 'Descrizione del torneo' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2025-11-01T10:00:00Z', description: 'Data di inizio del torneo' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-11-15T18:00:00Z', description: 'Data di fine del torneo' })
    @IsDateString()
    endDate: string;

    @ApiProperty({ example: 'single_elimination', enum: ['single_elimination', 'double_elimination', 'round_robin'], description: 'Tipo di torneo' })
    @IsEnum(['single_elimination', 'double_elimination', 'round_robin'])
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
}
