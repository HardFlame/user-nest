import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  // Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role, Roles } from '../decorators/auth.decorator';
import type { UserNestUncheckedUpdateInput } from 'src/generated/prisma/models';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async getUserByQuery(@Query() query: Record<string, string>) {
    return this.userService.users(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UserNestUncheckedUpdateInput,
  ) {
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
