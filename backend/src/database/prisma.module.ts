import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaService } from './prisma.service.js';

/**
 * Provides database access through dependency injection.
 *
 * Import PrismaModule into any module that needs PrismaService.
 * Keeping this module explicit makes database dependencies easier to test.
 */
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
