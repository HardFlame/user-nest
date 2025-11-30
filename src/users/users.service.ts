import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async user(UserNestWhereInput: Prisma.UserNestWhereUniqueInput) {
    return this.database.userNest.findUnique({
      where: UserNestWhereInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserNestWhereUniqueInput;
    where?: Prisma.UserNestWhereInput;
    orderBy?: Prisma.UserNestOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.database.userNest.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
  async createUser(dto: Prisma.UserNestCreateInput) {
    return this.database.userNest.create({ data: dto });
  }

  async updateUser(params: {
    where: Prisma.UserNestWhereUniqueInput;
    data: Prisma.UserNestUpdateInput;
  }) {
    const { where, data } = params;
    return this.database.userNest.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserNestWhereUniqueInput) {
    return this.database.userNest.delete({
      where,
    });
  }
}
