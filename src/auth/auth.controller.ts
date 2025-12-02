import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { type UserNestCreateInput } from 'src/generated/prisma/models';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: UserNestCreateInput) {
    const result = await this.authService.register(createUserDto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }
  //TODO
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(/*@Request() req*/) {
    return 'done'; //req.user;
  }
}
