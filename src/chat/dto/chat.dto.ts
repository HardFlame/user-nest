import { Socket } from 'socket.io';
import { userInJwtDto } from 'src/auth/dto/login.dto';
import { Room } from 'src/generated/prisma/client';

export interface AuthenticatedSocket extends Socket {
  user: userInJwtDto;
}

export type RoomType = keyof typeof Room;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type RoomWhisper = RoomType | `WHISPER_TO_${string}`;
