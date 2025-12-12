import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Request,
} from '@nestjs/common';
import { TasksService } from './task.service';
import { type TaskNest } from '../generated/prisma/client';
import { Public, Role, Roles } from '../decorators/auth.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Public()
  @Get()
  async getAllTasks() {
    return this.tasksService.tasks({});
  }

  @Public()
  @Get('userId=:userId')
  async getTasksByUserId(@Param('userId') userId: string) {
    return await this.tasksService.tasks({ where: { userId: +userId } });
  }

  @Public()
  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.tasksService.task({ id: +id });
  }

  @Put()
  create(
    @Body() createTaskDto: TaskNest,
    @Request() request: { user: { email: string; id: string } },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, updated, ...filteredDto } = createTaskDto;
    return this.tasksService.createTask(filteredDto, request);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: TaskNest,
    @Request() request: { user: { email: string; id: string } },
  ) {
    updateTaskDto.updated = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, ...filteredDto } = updateTaskDto;
    return this.tasksService.updateTask({
      where: {
        id: +id,
        AND: {
          userId: +request.user.id,
        },
      },
      data: filteredDto,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.tasksService.deleteTask({ id: +id });
  }
}
