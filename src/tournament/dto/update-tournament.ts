import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class UpdateTournamentDto {
    @ApiPropertyOptional({
        example: 'Campionato 2025 - Edizione aggiornata',
        description: 'Nome aggiornato del torneo',
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({
        example: 'Descrizione aggiornata del torneo',
        description: 'Descrizione del torneo',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: '2025-11-05T10:00:00Z',
        description: 'Nuova data di inizio del torneo',
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2025-11-20T18:00:00Z',
        description: 'Nuova data di fine del torneo',
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({
        example: 'double_elimination',
        enum: ['single_elimination', 'double_elimination', 'round_robin'],
        description: 'Tipo di torneo aggiornato',
    })
    @IsEnum(['single_elimination', 'double_elimination', 'round_robin'])
    @IsOptional()
    type?: 'single_elimination' | 'double_elimination' | 'round_robin';
}
