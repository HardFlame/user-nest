import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { type Request as RequestType } from 'express';
import { Role, ROLES_KEY } from '../decorators/auth.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth/auth.service';
import { userInJwtDto } from 'src/auth/dto/login.dto';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);
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
      const payload: userInJwtDto = await this.jwtService.verifyAsync(token, {
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
    } catch (err) {
      this.logger.error(JSON.stringify(err));
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

  private extractTokenFromHeader(
    request: RequestType | Socket,
  ): string | undefined {
    function isSocket(request: RequestType | Socket): request is Socket {
      return (request as Socket).handshake !== undefined;
    }
    const headers = isSocket(request)
      ? request.handshake.headers
      : request.headers;
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
