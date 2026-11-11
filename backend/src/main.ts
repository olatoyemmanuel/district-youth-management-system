import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { requestIdMiddleware } from './common/http/request-id.middleware.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(requestIdMiddleware);
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const origins = configService
    .getOrThrow<string>('CORS_ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key'],
    exposedHeaders: ['X-Request-Id', 'Retry-After'],
  });

  const trustProxyHops = configService.get<number>('TRUST_PROXY_HOPS', 0);
  if (trustProxyHops > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops);
  }

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`DYMS API listening on ${host}:${port}/api/v1`);
}

await bootstrap();
