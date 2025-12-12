import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { userInJwtDto } from 'src/auth/dto/login.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private usersService: UsersService) {
    const jwtSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: userInJwtDto) {
    const user = await this.usersService.user({ email: payload.email });
    if (!user) {
      throw new UnauthorizedException();
    }
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      refreshToken,
    };
  }
}
