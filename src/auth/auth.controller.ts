import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';

// import { JwtAuthGuard } from './jwt-auth.guard';
import { type UserNestCreateInput } from 'src/generated/prisma/models';
import { AuthService } from './auth.service';
import { Public } from '../decorators/auth.decorator';
import { type Request as RequestType } from 'express';
import { RefreshTokenGuard } from '../jwt/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: UserNestCreateInput) {
    const result = await this.authService.register(createUserDto);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login({
      email: body.email,
      password: body.password,
    });
  }

  @Get('profile')
  getProfile(@Request() req: RequestType) {
    const user = req.user as { email: string; id: number };
    return user;
  }

  @Get('logout')
  logout(@Request() req: RequestType) {
    const user = req.user as { id: number | string };
    if (!user.id) {
      throw new HttpException('Auth Error', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.logout(+user.id);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Request() req: RequestType) {
    const user = req.user as { id: number | string; refreshToken: string };
    if (!user.id) {
      throw new HttpException('Auth Error', HttpStatus.UNAUTHORIZED);
    }
    const refreshToken = user.refreshToken;
    return this.authService.refreshTokens(+user.id, refreshToken);
  }
}
