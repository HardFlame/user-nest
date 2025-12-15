import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  TaskNestOrderByWithRelationInput,
  TaskNestUncheckedCreateInput,
  TaskNestUncheckedUpdateInput,
  TaskNestWhereInput,
  TaskNestWhereUniqueInput,
} from 'src/generated/prisma/models';
import { type Request as RequestType } from 'express';
import { userInJwtDto } from 'src/auth/dto/login.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TasksService {
  constructor(
    private database: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  async task(TaskNestWhereUniqueInput: TaskNestWhereUniqueInput) {
    return await this.database.taskNest.findUnique({
      where: TaskNestWhereUniqueInput,
    });
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: TaskNestWhereUniqueInput;
    where?: TaskNestWhereInput;
    orderBy?: TaskNestOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const tasks = await this.database.taskNest.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    return tasks;
  }
  async createTask(
    dto: TaskNestUncheckedCreateInput,
    req: { user: userInJwtDto },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, updated, ...filteredDto } = dto;
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    filteredDto.userId = +req.user.id;
    const task = await this.database.taskNest.create({
      data: filteredDto,
    });
    if (task.id) {
      this.eventEmitter.emit('Task.created', task);
    }
    return task;
  }

  async updateTask(params: {
    where: TaskNestWhereUniqueInput;
    data: TaskNestUncheckedUpdateInput;
    req: RequestType;
  }) {
    const { where, data, req } = params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, ...filteredDto } = data;
    const user = req.user as userInJwtDto;
    if (!user.id) {
      throw new UnauthorizedException();
    }
    if (!user.roles.some((role) => role === 'ADMIN')) {
      where['AND'] = {
        userId: +user.id,
      };
    }
    filteredDto.updated = new Date();
    const task = await this.database.taskNest.update({
      data,
      where,
    });
    if (task.id) {
      this.eventEmitter.emit('Task.updated', task);
    }
    return task;
  }

  async deleteTask(where: TaskNestWhereUniqueInput) {
    const task = await this.database.taskNest.delete({
      where,
    });
    if (task.id) {
      this.eventEmitter.emit('Task.removed', task);
    }
    return task;
  }
}
