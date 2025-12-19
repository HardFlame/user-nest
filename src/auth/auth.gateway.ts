import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { type Request as RequestType } from 'express';
import { Logger, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from 'src/jwt/refreshToken.guard';

@WebSocketGateway({ namespace: '/auth' })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(AuthGateway.name);
  constructor(private authService: AuthService) {}

  handleConnection(client: Socket) {
    this.logger.log('connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('disconnected: ' + client.id);
  }

  @SubscribeMessage('login')
  async login(@MessageBody() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (error) {
      throw new WsException(String(error));
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('logout')
  logout(@Request() req: RequestType) {
    return this.authService.logout(req);
  }

  @UseGuards(RefreshTokenGuard)
  @SubscribeMessage('refresh')
  refreshTokens(@Request() req: RequestType) {
    return this.authService.refreshTokens(req);
  }
}
