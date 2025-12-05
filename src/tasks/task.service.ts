import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'src/generated/prisma/client';
import { TaskNestUncheckedCreateInput, TaskNestUncheckedUpdateInput } from 'src/generated/prisma/models';

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
    cursor?: Prisma.TaskNestWhereUniqueInput;
    where?: Prisma.TaskNestWhereInput;
    orderBy?: Prisma.TaskNestOrderByWithRelationInput;
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
    if (!user?.id) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED);
    }
    dto.userId = +user.id;
    return this.database.taskNest.create({
      data: dto,
    });
  }

  async updateTask(params: {
    where: Prisma.TaskNestWhereUniqueInput;
    data: TaskNestUncheckedUpdateInput;
  }) {
    const { where, data } = params;
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
