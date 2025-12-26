// blog/dto/blog-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BlogResponseDto {
  @ApiProperty({ example: '67a403c13b4df862d8091331' })
  _id: string;

  @ApiProperty({
    example: {
      _id: '67a403c13b4df862d8091000',
      name: 'Mario',
      last_name: 'Rossi',
      email: 'mario@email.com',
    },
  })
  createdBy: any;

  @ApiProperty({ example: 'Titolo del post' })
  subject: string;

  @ApiProperty({ example: 'Contenuto del post...' })
  description: string;

  @ApiProperty({ example: '/uploads/immagine.png' })
  image?: string;

  @ApiProperty({ example: 0 })
  likes: number;

  @ApiProperty({ type: [String], example: ['sport', 'news'] })
  tags: string[];
}
