import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'src/generated/prisma/client';
import bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async hashData(data: string) {
    const passSalt = process.env.PASS_SALT;
    if (!passSalt) {
      throw new Error('PASS_SALT environment variable is not set');
    }
    const genPassSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, genPassSalt);
  }

  async user(UserNestWhereInput: Prisma.UserNestWhereUniqueInput) {
    return this.database.userNest.findUnique({
      where: UserNestWhereInput,
    });
  }

  async users(rawQuery: {
    skip?: string;
    take?: string;
    cursor?: string;
    where?: string;
    orderBy?: string;
  }) {
    const query: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserNestWhereUniqueInput;
      where?: Prisma.UserNestWhereInput;
      orderBy?: Prisma.UserNestOrderByWithRelationInput;
    } = { where: { deleted: false } };

    if (rawQuery.where) {
      try {
        const customWhere = JSON.parse(
          rawQuery.where,
        ) as Prisma.UserNestWhereInput;
        query.where = {
          ...query.where,
          AND: {
            ...customWhere,
          },
        };
      } catch {
        // Ignore invalid JSON, use default where clause
      }
    }

    if (rawQuery.skip) {
      const skipNum = parseInt(rawQuery.skip, 10);
      if (!isNaN(skipNum) && skipNum >= 0) {
        query.skip = skipNum;
      }
    }

    if (rawQuery.take) {
      const takeNum = parseInt(rawQuery.take, 10);
      if (!isNaN(takeNum) && takeNum > 0) {
        query.take = takeNum;
      }
    }

    if (rawQuery.orderBy) {
      try {
        query.orderBy = JSON.parse(
          rawQuery.orderBy,
        ) as Prisma.UserNestOrderByWithRelationInput;
      } catch {
        // Ignore invalid JSON, no ordering applied
      }
    }
    try {
      return this.database.userNest.findMany(query);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'something wrong with query',
        HttpStatus.NO_CONTENT,
      );
    }
  }
  async createUser(dto: Prisma.UserNestCreateInput) {
    if (dto.password) {
      dto.password = await this.hashData(dto.password);
    }
    return this.database.userNest.create({ data: dto });
  }

  async updateUser(params: {
    where: Prisma.UserNestWhereUniqueInput;
    data: Prisma.UserNestUncheckedUpdateInput;
  }) {
    const { where, data } = params;
    if (typeof data.password === 'string') {
      data.password = await this.hashData(data.password);
    } else if (data.password) {
      throw new HttpException('password is incorrect', HttpStatus.UNAUTHORIZED);
    }
    return this.database.userNest.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserNestWhereUniqueInput) {
    const data = { deleted: true };
    try {
      return await this.database.userNest.update({
        data,
        where: {
          ...where,
          AND: [
            {
              NOT: {
                roles: {
                  has: 'ADMIN',
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'You cannot delete the administrator',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
}
