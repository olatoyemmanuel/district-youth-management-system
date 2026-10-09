import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

/**
 * Application entry point.
 *
 * The global API prefix provides a stable versioned namespace.
 * Shutdown hooks allow NestJS to respond to termination signals
 * gracefully when the application is stopped or redeployed.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  await app.listen(port, host);

  console.log(`DYMS API listening on ${host}:${port}/api/v1`);
}

await bootstrap();
