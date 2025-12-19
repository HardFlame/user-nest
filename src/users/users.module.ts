import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseService } from 'src/database/database.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [UsersService, DatabaseService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
