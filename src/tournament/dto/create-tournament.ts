import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsEnum(['single_elimination', 'double_elimination', 'round_robin'])
    type: 'single_elimination' | 'double_elimination' | 'round_robin';
}
