import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AppService } from './app.service.js';
import { PrismaService } from './database/prisma.service.js';

/**
 * API root, liveness, and readiness endpoints.
 *
 * Liveness checks the HTTP application itself.
 * Readiness checks whether PostgreSQL can execute a query.
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Basic API response retained from the initial NestJS scaffold.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Liveness check: confirms that the HTTP application responds.
   *
   * This endpoint intentionally does not query external dependencies.
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

  /**
   * Readiness check: confirms that PostgreSQL can execute a query.
   *
   * Return HTTP 503 when the database is unavailable. Do not expose
   * raw driver errors, connection details, or credentials to clients.
   */
  @Get('health/ready')
  async getReadiness(): Promise<{
    status: 'ready';
    service: string;
    dependencies: {
      database: 'ok';
    };
    timestamp: string;
  }> {
    try {
      // Execute a real, read-only query to verify database connectivity.
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        service: 'dyms-api',
        dependencies: {
          database: 'ok',
        },
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        service: 'dyms-api',
        dependencies: {
          database: 'unavailable',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}