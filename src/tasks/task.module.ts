import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [TasksService, DatabaseService],
  exports: [TasksService],
})
export class TasksModule {}
