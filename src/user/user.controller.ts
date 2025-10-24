import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import {JwtAuthGuard} from "../auth/auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/role.decorator";
import {ROLES} from "../auth/roles";
import {CreateUserDto} from "./dto/create-user";
import {ClientGuard} from "../auth/client.guard";
import {UpdateUserDto} from "./dto/update-user";


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([ROLES.ADMIN])
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.userService.create({...body, type_user: ROLES.DEFAULT});
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
