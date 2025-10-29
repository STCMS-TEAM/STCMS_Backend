import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .select('-password')
      .populate('tournamentsCreated')
      .exec();
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      this.userModel.find({}, { password: 0 }).skip(skip).limit(limit),
      this.userModel.countDocuments(),
    ]);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .populate('tournamentsCreated')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('tournamentsCreated')
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any): Promise<User> {
    const newUser = new this.userModel(data);
    return await newUser.save();
  }

  async update(id: string, data: any): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, data);
    await user.save();

    // @ts-ignore
    user['password'] = undefined;
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndUpdate(id, {
      isActive: false
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
