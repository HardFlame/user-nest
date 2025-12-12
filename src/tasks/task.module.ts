import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { DatabaseService } from 'src/database/database.service';
import { TasksController } from './task.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [TasksService, DatabaseService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
