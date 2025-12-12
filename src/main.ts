import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  // WINSTON_MODULE_NEST_PROVIDER,
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import winston from 'winston';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        nestWinstonModuleUtilities.format.nestLike('Nest', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/'),
          filename: 'logs.log',
        }),
      ],
    }),
  });
  await app.listen(process.env.PORT ?? 3000);
  app.enableShutdownHooks();
}
bootstrap();
