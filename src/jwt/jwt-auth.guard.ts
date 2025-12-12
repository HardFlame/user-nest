import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Role, ROLES_KEY } from '../decorators/auth.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth/auth.service';
import { Roles } from 'src/generated/prisma/enums';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UsersService,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
      const payload: { email: string; id: number; roles: Roles } =
        await this.jwtService.verifyAsync(token, {
          secret: jwtSecret,
        });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request['user'] = payload;
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (requiredRoles) {
        const roles = payload.roles;
        const hasRole = requiredRoles.some((role) => roles?.includes(role));
        if (!hasRole) throw new ForbiddenException('You shall not pass');
      }
    } catch {
      throw new ForbiddenException('You shall not pass');
    }
    return true;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.authService.hashData(refreshToken);
    return await this.userService.updateUser({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
