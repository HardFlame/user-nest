import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from 'src/generated/prisma/client';
import bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async hashData(data: string) {
    const passSalt = await bcrypt.genSalt(10); //process.env.PASS_SALT;
    if (!passSalt) {
      throw new Error('PASS_SALT environment variable is not set');
    }
    return await bcrypt.hash(data, passSalt);
  }

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
      throw new HttpException('password is incorrect', HttpStatus.BAD_GATEWAY);
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
