import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import bcrypt from 'bcrypt';
import {
  UserNestWhereUniqueInput,
  UserNestWhereInput,
  UserNestOrderByWithRelationInput,
  UserNestCreateInput,
  UserNestUncheckedUpdateInput,
} from 'src/generated/prisma/models';
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(private database: DatabaseService) {}

  async hashData(data: string) {
    const passSalt = process.env.PASS_SALT;
    if (!passSalt) {
      throw new Error('PASS_SALT environment variable is not set');
    }
    const genPassSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, genPassSalt);
  }

  async user(UserNestWhereInput: UserNestWhereUniqueInput) {
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
      cursor?: UserNestWhereUniqueInput;
      where?: UserNestWhereInput;
      orderBy?: UserNestOrderByWithRelationInput;
    } = { where: { deleted: false } };

    if (rawQuery.where) {
      try {
        const customWhere = JSON.parse(rawQuery.where) as UserNestWhereInput;
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
        ) as UserNestOrderByWithRelationInput;
      } catch {
        // Ignore invalid JSON, no ordering applied
      }
    }
    try {
      return this.database.userNest.findMany(query);
    } catch (error) {
      this.logger.warn(error);
      throw new HttpException(
        'something wrong with query',
        HttpStatus.NO_CONTENT,
      );
    }
  }
  async createUser(dto: UserNestCreateInput) {
    if (dto.password) {
      dto.password = await this.hashData(dto.password);
    }
    return this.database.userNest.create({ data: dto });
  }

  async updateUser(params: {
    where: UserNestWhereUniqueInput;
    data: UserNestUncheckedUpdateInput;
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

  async deleteUser(where: UserNestWhereUniqueInput) {
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
      this.logger.warn(error);
      throw new HttpException(
        'You cannot delete the administrator',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }
}
