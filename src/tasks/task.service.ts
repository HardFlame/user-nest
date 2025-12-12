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

@Injectable()
export class TasksService {
  constructor(private database: DatabaseService) {}

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
    req: { user: userInJwtDto },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created, updated, ...filteredDto } = dto;
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    dto.userId = +req.user.id;
    return this.database.taskNest.create({
      data: filteredDto,
    });
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
    return this.database.taskNest.update({
      data,
      where,
    });
  }

  async deleteTask(where: TaskNestWhereUniqueInput) {
    return this.database.taskNest.delete({
      where,
    });
  }
}
