import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

/**
 * Root module for the District Youth Management System API.
 *
 * Rate limiting is registered globally so new controllers are protected
 * by default unless a route is explicitly configured otherwise.
 *
 * The default in-memory throttler storage is suitable for initial local
 * development and a single application instance. Multi-instance production
 * deployments will need shared storage, such as Redis.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
