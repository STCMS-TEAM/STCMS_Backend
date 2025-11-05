import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum MatchStatus {
    PENDING = 'pending',
    LIVE = 'live',
    COMPLETED = 'completed',
}

export class UpdateMatchStatusDto {
    @ApiProperty({
        example: 'completed',
        description: 'Nuovo stato del match',
        enum: MatchStatus,
    })
    @IsEnum(MatchStatus, { message: 'Lo stato deve essere uno tra scheduled, ongoing, completed o canceled' })
    status: MatchStatus;
}
