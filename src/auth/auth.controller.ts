import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from '../jwt/refreshToken.guard';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { type Request as RequestType } from 'express';
import { LoginDto, userInJwtDto } from './dto/login.dto';
import type { UserNestUncheckedCreateInput } from 'src/generated/prisma/models';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: UserNestUncheckedCreateInput) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestType) {
    const user = req.user as userInJwtDto;
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Request() req: RequestType) {
    return this.authService.logout(req);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Request() req: RequestType) {
    return this.authService.refreshTokens(req);
  }
}
