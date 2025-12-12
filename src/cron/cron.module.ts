import { Logger, Module } from '@nestjs/common';
import { ServerStatus } from './serverStatus.service';
// import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [],
  providers: [ServerStatus, Logger],
  exports: [ServerStatus],
})
export class CronModule {}
