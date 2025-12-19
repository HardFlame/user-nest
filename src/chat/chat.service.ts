import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import type {
  ChatNestOrderByWithRelationInput,
  ChatNestUncheckedCreateInput,
  ChatNestWhereInput,
  ChatNestWhereUniqueInput,
} from 'src/generated/prisma/models';
import { Room } from 'src/generated/prisma/enums';
import { AuthenticatedSocket, RoomType, RoomWhisper } from './dto/chat.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private chats: RoomType[] = Array.from(
    Object.values(Room as Record<RoomType, RoomType>),
  );

  constructor(
    private database: DatabaseService,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}

  chatList(): RoomType[] {
    return this.chats || [];
  }
  // User connection management
  async joinTo(
    client: AuthenticatedSocket,
    data: { chats: Room[] },
  ): Promise<RoomWhisper[]> {
    const userName = client.user.name;
    const rooms: RoomType[] = ['GLOBAL', 'DEFAULT'];
    const requestedChats = data.chats;
    if (data.chats) {
      for (let i = 0; i < requestedChats.length; i++) {
        const chat = String(requestedChats[i]).toUpperCase() as RoomType;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (Room[chat]) {
          rooms.push(chat);
        }
      }
    }
    const roomWithWhisper: RoomWhisper[] = (rooms as RoomWhisper[]).concat([
      `WHISPER_TO_${userName}`,
    ]);
    await client.join(roomWithWhisper);
    if (roomWithWhisper.length > 0) {
      this.eventEmitter.emit('User.joined', roomWithWhisper);
    }
    this.logger.log(
      `User ${client.id}(${client.user.email}) connected to rooms: ${JSON.stringify(rooms)}`,
    );
    return Array.from(client.rooms as Set<RoomWhisper>);
  }

  async leaveFrom(client: AuthenticatedSocket, data: { chats: RoomType[] }) {
    const requestedChats = data.chats;
    // const memoriedRooms = new Set(client.rooms.values());
    const leavedRooms: Set<RoomWhisper> = new Set();
    if (requestedChats) {
      for (let i = 0; i < requestedChats.length; i++) {
        const chat = String(requestedChats[i]).toUpperCase() as RoomType;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (Room?.[chat]) {
          await client.leave(chat as string);
          leavedRooms.add(chat);
        }
      }
    }
    if (leavedRooms.size > 0) {
      this.eventEmitter.emit('Chat.User.joined', {
        userName: client.user.name,
        rooms: Array.from(leavedRooms),
      });
    }
    return Array.from(client.rooms);
  }

  leaveFromAll(client: AuthenticatedSocket) {
    const rooms = client.rooms;
    if (rooms.size > 0) {
      this.eventEmitter.emit('Chat.User.leaved', {
        userName: client.user.name,
        rooms: Array.from(rooms),
      });
    }
    client.rooms.clear();
  }

  // Chat message handling
  async sendMessage(
    client: AuthenticatedSocket,
    message: ChatNestUncheckedCreateInput,
  ) {
    const user = client.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    message.userId = +user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (message?.room === 'WHISPER' && !message?.sendedTo) {
      throw new BadRequestException(
        'If you are whispering, it is important to tell who you are whispering to.',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const chat = await this.database.chatNest.create({ data: message });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (chat?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const room = chat.room;
      if (room !== 'WHISPER') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.eventEmitter.emit('Chat.message.new', { chat, room });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (chat?.sendedTo) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userTo = await this.usersService.user({ id: +chat.sendedTo });
        const roomForWhisper: RoomWhisper = `WHISPER_TO_${userTo?.name}`;
        this.eventEmitter.emit('Chat.message.new', {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          chat,
          room: roomForWhisper,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return chat;
    } else {
      throw new BadRequestException('Something wrong with create message');
    }
  }

  async getMessages(params: {
    skip?: number;
    take?: number;
    cursor?: ChatNestWhereUniqueInput;
    where?: ChatNestWhereInput;
    orderBy?: ChatNestOrderByWithRelationInput;
  }) {
    // const { skip, take, cursor, where, orderBy } = params;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const messages = await this.database.chatNest.findMany(params);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return messages;
  }
}
