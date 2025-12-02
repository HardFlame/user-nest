import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  // Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { type UserNest } from 'src/generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.userService.users({});
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.user({ id: +id });
  }

  /*@Put()
  create(@Body() createUserDto: UserNest) {
    return this.userService.createUser(createUserDto);
  }*/

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UserNest) {
    return this.userService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser({ id: +id });
  }
}
