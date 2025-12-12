import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { type UserNestCreateInput } from 'src/generated/prisma/models';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from '../jwt/refreshToken.guard';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { type Request as RequestType } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: UserNestCreateInput) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestType) {
    const user = req.user as { email: string; id: number };
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Request() req: RequestType) {
    return this.authService.logout(req);
  }

  @UseGuards(JwtAuthGuard, RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Request() req: RequestType) {
    return this.authService.refreshTokens(req);
  }
}
