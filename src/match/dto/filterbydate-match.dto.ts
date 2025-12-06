import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class MatchesQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDateTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDateTime?: Date;

  @IsOptional()
  status?: string;
}
