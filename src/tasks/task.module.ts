import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { DatabaseService } from 'src/database/database.service';
import { TasksController } from './task.controller';
import { UsersModule } from 'src/users/users.module';
import { TasksGateway } from './task.gateway';

@Module({
  imports: [UsersModule],
  providers: [TasksService, DatabaseService, TasksGateway],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
