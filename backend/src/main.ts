import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

/**
 * Application entry point.
 *
 * ConfigModule validates environment variables before the application
 * starts. The validated HOST and PORT values determine the listener.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  console.log(`DYMS API listening on ${host}:${port}/api/v1`);
}

await bootstrap();
