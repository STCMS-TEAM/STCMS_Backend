import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Blog} from "./blog.schema";

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private readonly blogModel: Model<Blog>) {}
    async create(data: Partial<Blog>): Promise<Blog> {
      const newBlog = new this.blogModel(data);
      return newBlog.save();
    }


  async findAll(): Promise<any[]> {
    return this.blogModel
      .find()
      .populate('createdBy', 'name last_name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
  async update(
  blogId: string,
  data: Partial<Blog>,
): Promise<Blog | null> {
  return this.blogModel
    .findByIdAndUpdate(blogId, data, { new: true })
    .populate('createdBy', 'name last_name email')
    .exec();
}

async delete(blogId: string): Promise<Blog | null> {
  return this.blogModel.findByIdAndDelete(blogId).exec();
}
async findById(blogId: string): Promise<Blog | null> {
  return this.blogModel.findById(blogId).populate('createdBy', 'name last_name email').exec();
}
async findByTags(tags: string[]): Promise<Blog[]> {
  return this.blogModel
    .find({
      tags: { $in: tags }, // almeno uno dei tag
      //tutti i tag obbligatori → usa $all invece di $in tags: { $all: tags }
    })
    .sort({ createdAt: -1 })
    .exec();
}

async addLike(blogId: string, userId: string): Promise<Blog | null> {
  return this.blogModel.findOneAndUpdate(
    {
      _id: blogId,
      likedBy: { $ne: userId }, //  SOLO se NON ha già messo like
    },
    {
      $addToSet: { likedBy: userId }, //  evita duplicati
      $inc: { likes: 1 },             //  incrementa contatore
    },
    { new: true },
  );
}

async removeLike(blogId: string, userId: string): Promise<Blog | null> {
  return this.blogModel.findOneAndUpdate(
    {
      _id: blogId,
      likedBy: userId, // SOLO se l’utente ha messo like
    },
    {
      $pull: { likedBy: userId }, //  rimuove l’utente
      $inc: { likes: -1 },        //  decrementa
    },
    { new: true },
  );
}

async toggleLike(blogId: string, userId: string): Promise<Blog | null> {
  const userObjectId = new Types.ObjectId(userId);

  const blog = await this.blogModel.findOneAndUpdate(
    {
      _id: blogId,
      likedBy: { $ne: userObjectId },
    },
    {
      $addToSet: { likedBy: userObjectId },
      $inc: { likes: 1 },
    },
    { new: true },
  );

  if (blog) return blog;

  // se l'utente ha già messo like, togli il like (UNLIKE)
  return this.blogModel.findOneAndUpdate(
    { _id: blogId, likedBy: userObjectId },
    { $pull: { likedBy: userObjectId }, $inc: { likes: -1 } },
    { new: true },
  );
}




}
