import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
// import { CreateChatDto } from './dto/create-chat.dto';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import type { AuthenticatedSocket, RoomType } from './dto/chat.dto';
import { Room } from 'src/generated/prisma/enums';
import { OnEvent } from '@nestjs/event-emitter';
import type {
  ChatNestOrderByWithRelationInput,
  ChatNestUncheckedCreateInput,
  ChatNestWhereInput,
  ChatNestWhereUniqueInput,
} from 'src/generated/prisma/models';
import type { ChatNest } from 'src/generated/prisma/client';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Clients should authenticate on connection
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.chatService.leaveFromAll(client);
  }

  @SubscribeMessage('chatList')
  chatList(): Room[] {
    return this.chatService.chatList();
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('connectTo')
  async joinTo(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chats: Room[] },
    // @Request() req: RequestType,
  ) {
    try {
      const rooms = await this.chatService.joinTo(client, data);
      this.server
        .to(rooms)
        .emit('user joined', `user "${client.user.name}" joined`);
      return rooms;
    } catch (err) {
      throw new WsException(String(err));
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveFrom')
  async leaveFrom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chats: Room[] },
    // @Request() req: RequestType,
  ) {
    try {
      const rooms = await this.chatService.leaveFrom(client, data);
      this.server
        .to(rooms)
        .emit('user leaves', `user "${client.user.name}" leaves`);
      return rooms;
    } catch (err) {
      throw new WsException(String(err));
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() message: ChatNestUncheckedCreateInput,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.chatService.sendMessage(client, message);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('getMessages')
  async getMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    params: {
      skip?: number;
      take?: number;
      cursor?: ChatNestWhereUniqueInput;
      where?: ChatNestWhereInput;
      orderBy?: ChatNestOrderByWithRelationInput;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.chatService.getMessages(params);
  }

  @OnEvent('Chat.User.joined')
  private emitJoined({
    userName,
    rooms,
  }: {
    userName: string;
    rooms: RoomType;
  }) {
    this.server.to(rooms).emit('user joined', `user "${userName}" joined`);
  }

  @OnEvent('Chat.User.leaved')
  private emitLeaves({
    userName,
    rooms,
  }: {
    userName: string;
    rooms: RoomType;
  }) {
    this.server.to(rooms).emit('user leaved', `user "${userName}" leaved`);
  }

  @OnEvent('Chat.message.new')
  private emitMessage({ chat, room }: { chat: ChatNest; room: RoomType }) {
    this.server.to(room).emit('new message', chat);
  }
}
