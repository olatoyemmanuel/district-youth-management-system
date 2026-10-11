import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Owns the Prisma Client lifecycle for the NestJS application.
 *
 * Prisma 7 uses a PostgreSQL driver adapter. The connection URL comes
 * from validated environment configuration and is never hard-coded here.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const connectionString =
      configService.getOrThrow<string>('DATABASE_URL');

    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  /**
   * Establish the database connection during application startup.
   * Startup fails visibly if the configured database is unavailable.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Release database resources during graceful application shutdown.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
