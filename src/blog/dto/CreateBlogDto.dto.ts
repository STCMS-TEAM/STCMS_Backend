// blog/dto/CreateBlogDto.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateBlogDto {
  @ApiProperty({ example: 'Titolo del post' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Descrizione del contenuto del post' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Lista dei tag (separati da virgola o multipli)',
    example: ['sport', 'news'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map((tag: string) => tag.trim());
  })
  tags?: string[];
}
