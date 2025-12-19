import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [DatabaseService, ChatGateway, ChatService],
})
export class ChatModule {}
