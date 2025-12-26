import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import type { Multer } from 'multer';

import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';

import { CreateBlogDto } from './dto/CreateBlogDto.dto';
import { BlogResponseDto } from './dto/blog-response.dto';
import { Patch, Delete, NotFoundException } from '@nestjs/common';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from './guards/owner.guard';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { Query, BadRequestException } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';


@ApiTags('Blog')
@ApiExtraModels(BlogResponseDto)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

@Post(':id')
@ApiOperation({ summary: 'Crea un nuovo post del blog' })
@ApiConsumes('multipart/form-data')
@ApiParam({ name: 'id', description: 'ID dell’utente creatore' })
@ApiBody({
  description: 'Dati del post + immagine',
  schema: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      description: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      image: {
        type: 'string',
        format: 'binary', // UPLOAD
      },
    },
    required: ['subject', 'description'],
  },
})
@UseInterceptors(FileInterceptor('image'))
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
async create(
  @Param('id') id: string,
  @Body() body: CreateBlogDto,
  @UploadedFile() file?: Multer.File,
): Promise<BlogResponseDto> {

  const imagePath = file ? `/uploads/${file.filename}` : undefined;

  const blogData = {
    createdBy: new Types.ObjectId(id), // SOLO DA PARAM
    subject: body.subject,
    description: body.description,
    image: imagePath,
    likes: 0,
    tags: body.tags ?? [],
  };

  const created = await this.blogService.create(blogData);

  return created.toObject() as BlogResponseDto;
}

@Get()
@ApiOperation({ summary: 'Ottiene l’elenco di tutti i post del blog' })
@ApiOkResponse({
  description: 'Lista dei post trovata con successo',
  type: [BlogResponseDto],
})
async findAll(): Promise<BlogResponseDto[]> {
  const blogs = await this.blogService.findAll();

 return blogs as BlogResponseDto[];

}

@Patch(':blogId')
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Aggiorna un post del blog' })
@ApiConsumes('multipart/form-data')
@ApiParam({ name: 'blogId', description: 'ID del post da aggiornare' })
@ApiOkResponse({
  description: 'Post aggiornato con successo',
  type: BlogResponseDto,
})
@ApiBody({
  description: 'Campi aggiornabili + immagine opzionale',
  schema: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      description: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' },
      },
      image: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(FileInterceptor('image'))
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
async update(
  @Param('blogId') blogId: string,
  @Body() body: UpdateBlogDto,
  @UploadedFile() file?: Multer.File,
  //@Req() req,
): Promise<BlogResponseDto> {

  const updateData: any = {
    ...body,
  };

  if (file) {
    updateData.image = `/uploads/${file.filename}`;
  }

  const updated = await this.blogService.update(blogId, updateData);

  if (!updated) {
    throw new NotFoundException('Blog non trovato');
  }

  return updated.toObject() as BlogResponseDto;
}
@Delete(':blogId')
@ApiOperation({ summary: 'Elimina un post del blog' })
@ApiParam({ name: 'blogId', description: 'ID del post da eliminare' })
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
@ApiOkResponse({ description: 'Post eliminato con successo' })
async remove(
  @Param('blogId') blogId: string,
): Promise<{ message: string }> {

  const deleted = await this.blogService.delete(blogId);

  if (!deleted) {
    throw new NotFoundException('Blog non trovato');
  }

  return { message: 'Post eliminato con successo' };
}

@Patch(':blogId/like')
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Metti like a un post (una sola volta)' })
@ApiParam({ name: 'blogId', description: 'ID del post' })
@ApiOkResponse({ type: BlogResponseDto })
async likeBlog(
  @Param('blogId') blogId: string,
  @Req() req,
): Promise<BlogResponseDto> {

  const userId = req.user.userId; 

  const blog = await this.blogService.addLike(blogId, userId);

  if (!blog) {
    throw new BadRequestException('Like già inserito o blog non trovato');
  }

  return blog.toObject() as BlogResponseDto;
}

@Patch(':blogId/unlike')
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Rimuove il like da un post del blog' })
@ApiParam({ name: 'blogId', description: 'ID del post' })
@ApiOkResponse({ description: 'Like rimosso', type: BlogResponseDto })
async unlikeBlog(
  @Param('blogId') blogId: string,
  @Req() req,
): Promise<BlogResponseDto> {

  const userId = req.user.userId;

  const blog = await this.blogService.removeLike(blogId, userId);

  if (!blog) {
    throw new BadRequestException(
      'Non puoi togliere il like se non lo hai messo',
    );
  }

  return blog.toObject() as BlogResponseDto;
}


@Get('by-tags')
@ApiOperation({ summary: 'Ritorna i blog filtrati per uno o più tag' })
@ApiQuery({
  name: 'tags',
  required: true,
  description: 'Lista di tag separati da virgola (es: sport,news)',
  type: String,
})
@ApiOkResponse({
  description: 'Blog filtrati per tag',
  type: [BlogResponseDto],
})
async findByTags(
  @Query('tags') tags: string,
): Promise<BlogResponseDto[]> {

  if (!tags) {
    throw new BadRequestException('Il parametro tags è obbligatorio');
  }

  // Converte "sport,news" → ["sport", "news"]
  const tagsArray = tags.split(',').map(tag => tag.trim());

  const blogs = await this.blogService.findByTags(tagsArray);

  return blogs.map(blog => blog.toObject() as BlogResponseDto);
}

@Patch(':blogId/toggle-like')
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Toggle like: aggiunge o rimuove il like a seconda dello stato' })
@ApiParam({ name: 'blogId', description: 'ID del post del blog' })
@ApiOkResponse({ description: 'Stato like aggiornato', type: BlogResponseDto })
async toggleLike(
  @Param('blogId') blogId: string,
  @Req() req,
): Promise<BlogResponseDto> {

  const userId = req.user.userId;

  const blog = await this.blogService.toggleLike(blogId, userId);

  if (!blog) {
    throw new NotFoundException('Blog non trovato');
  }

  return blog.toObject() as BlogResponseDto;
}

}
