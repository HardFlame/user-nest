import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TasksService } from './tasks/task.service';
import { TasksController } from './tasks/task.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AppController, UsersController, TasksController],
  providers: [AppService, UsersService, TasksService],
  exports: [],
})
export class AppModule {}
