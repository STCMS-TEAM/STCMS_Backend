import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/role.decorator';
import { ROLES } from '../auth/roles';
import { CreateUserDto } from './dto/create-user';
import { ClientGuard } from '../auth/client.guard';
import { UpdateUserDto } from './dto/update-user';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users returned successfully.' })
  async getAll(@Query('page') page?: number, @Query('limit') limit?: number): Promise<any> {
    if (page && limit) {
      return this.userService.findAllPaginated(+page, +limit);
    }
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.userService.create({ ...body, type_user: 'default' });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto): Promise<User> {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ClientGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
