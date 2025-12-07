import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  // Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, type UserNest } from 'src/generated/prisma/client';
import { Public, Role, Roles } from 'src/auth/auth.decorator';
import { TasksService } from 'src/tasks/task.service';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private tasksService: TasksService,
  ) {}

  @Get([':id', ':where', ':skip', ':take', ':orderby'])
  async getUserByQuery(
    @Param('id') id?: string,
    @Query('where') where?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.UserNestWhereUniqueInput;
      where?: Prisma.UserNestWhereInput;
      orderBy?: Prisma.UserNestOrderByWithRelationInput;
    } = { where: { deleted: false } };
    if (id && +id > 0) {
      params.where = { ...params.where, id: +id };
    } else {
      if (where) {
        try {
          const customWhere = JSON.parse(where) as Prisma.UserNestWhereInput;
          params.where = {
            ...params.where,
            AND: {
              ...customWhere,
            },
          };
        } catch {
          // Ignore invalid JSON, use default where clause
        }
      }

      if (skip) {
        const skipNum = parseInt(skip, 10);
        if (!isNaN(skipNum) && skipNum >= 0) {
          params.skip = skipNum;
        }
      }

      if (take) {
        const takeNum = parseInt(take, 10);
        if (!isNaN(takeNum) && takeNum > 0) {
          params.take = takeNum;
        }
      }

      if (orderBy) {
        try {
          params.orderBy = JSON.parse(
            orderBy,
          ) as Prisma.UserNestOrderByWithRelationInput;
        } catch {
          // Ignore invalid JSON, no ordering applied
        }
      }
    }
    try {
      return this.userService.users(params);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'something wrong with query',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // @Get(':id')
  // async getUserById(@Param('id') id: string) {
  //   return this.userService.user({ id: +id });
  // }

  @Public()
  @Get(':id/tasks')
  async getTasksByUserId(@Param('id') id: string) {
    return await this.tasksService.tasks({ where: { userId: +id } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UserNest) {
    return this.userService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.deleteUser({ id: +id });
  }
}
