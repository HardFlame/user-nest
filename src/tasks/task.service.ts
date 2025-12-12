import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma, Roles } from 'src/generated/prisma/client';
import {
  TaskNestOrderByWithRelationInput,
  TaskNestUncheckedCreateInput,
  TaskNestUncheckedUpdateInput,
  TaskNestWhereInput,
  TaskNestWhereUniqueInput,
} from 'src/generated/prisma/models';
import { type Request as RequestType } from 'express';

@Injectable()
export class TasksService {
  constructor(private database: DatabaseService) {}

  async task(TaskNestWhereUniqueInput: Prisma.TaskNestWhereUniqueInput) {
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
    return this.database.taskNest.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async createTask(
    dto: TaskNestUncheckedCreateInput,
    { user }: { user: { email: string; id: string } },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, updated, ...filteredDto } = dto;
    if (!user?.id) {
      throw new UnauthorizedException();
    }
    dto.userId = +user.id;
    return this.database.taskNest.create({
      data: filteredDto,
    });
  }

  async updateTask(params: {
    where: Prisma.TaskNestWhereUniqueInput;
    data: TaskNestUncheckedUpdateInput;
    req: RequestType;
  }) {
    const { where, data, req } = params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, ...filteredDto } = data;
    const user = req.user as { id: string; email: string; roles: Roles[] };
    if (!user.id) {
      throw new UnauthorizedException();
    }
    if (!user.roles.some((role) => role === 'ADMIN')) {
      where['AND'] = {
        userId: +user.id,
      };
    }
    filteredDto.updated = new Date();
    return this.database.taskNest.update({
      data,
      where,
    });
  }

  async deleteTask(where: Prisma.TaskNestWhereUniqueInput) {
    return this.database.taskNest.delete({
      where,
    });
  }
}
