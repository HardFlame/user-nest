import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ServerStatus {
  private logger = new Logger(ServerStatus.name);
  constructor() {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  private checkServerStatus() {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const statusMessage = `
      ===== SERVER STATUS CHECK =====
      Timestamp: ${timestamp}
      Uptime: ${(uptime / 60).toFixed(2)} minutes
      Memory Usage:
        - RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
        - Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
        - Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
        - External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB
      ==============================
    `;
    this.logger.log(statusMessage);
  }
}
