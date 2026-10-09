import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service.js';

/**
 * Temporary root and health endpoints for the initial API scaffold.
 *
 * The health endpoint is a liveness check only. It does not yet verify
 * PostgreSQL, Redis, queues, or other external dependencies.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Basic API response retained from the initial NestJS scaffold.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Confirms that the HTTP application is responding.
   */
  @Get('health')
  getHealth(): {
    status: 'ok';
    service: string;
    timestamp: string;
  } {
    return {
      status: 'ok',
      service: 'dyms-api',
      timestamp: new Date().toISOString(),
    };
  }
}
