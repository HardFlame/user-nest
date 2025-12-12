import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './task.service';
import { type TaskNest } from '../generated/prisma/client';
import { Role, Roles } from '../decorators/auth.decorator';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { type Request as RequestType } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks() {
    return this.tasksService.tasks({});
  }

  @Get('userId=:userId')
  async getTasksByUserId(@Param('userId') userId: string) {
    return await this.tasksService.tasks({ where: { userId: +userId } });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.tasksService.task({ id: +id });
  }

  @Put()
  create(
    @Body() createTaskDto: TaskNest,
    @Request() request: { user: { email: string; id: string } },
  ) {
    return this.tasksService.createTask(createTaskDto, request);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: TaskNest,
    @Request() req: RequestType,
  ) {
    return this.tasksService.updateTask({
      where: {
        id: +id,
      },
      data: updateTaskDto,
      req,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.deleteTask({ id: +id });
  }
}
