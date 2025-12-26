
import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blog.schema';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Blog', schema: BlogSchema }]),
    //controllers: [BlogController], // <- controller incluso
    //providers: [BlogService],
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '../../uploads'),
        filename: (req, file, callback) => {
          const ext = file.originalname.split('.').pop();
          callback(null, `${uuidv4()}.${ext}`);
        },
      }),
    }),
  ],
  controllers: [BlogController],  
  providers: [BlogService],       
})
export class BlogModule {}

