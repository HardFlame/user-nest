import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  // Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { type UserNest } from 'src/generated/prisma/client';
import { Public, Role, Roles } from 'src/auth/auth.decorator';
import { TasksService } from 'src/tasks/task.service';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private tasksService: TasksService,
  ) {}

  @Get()
  async getAllUsers() {
    return this.userService.users({ where: { deleted: false } });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.user({ id: +id });
  }

  @Public()
  @Get(':id/tasks')
  async getTasksByUserId(@Param('id') id: string) {
    return await this.tasksService.tasks({ where: { userId: +id } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UserNest) {
    return this.userService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.deleteUser({ id: +id });
  }
}
