import { Module } from '@nestjs/common';

import { PrismaModule } from '../database/prisma.module.js';
import { AccessTokenGuard } from './access-token.guard.js';
import { AccessTokenService } from './access-token.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CsrfGuard } from './csrf.guard.js';
import { PasswordHasherService } from './password-hasher.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasherService,
    AccessTokenService,
    AccessTokenGuard,
    CsrfGuard,
  ],
  exports: [AuthService, AccessTokenGuard, CsrfGuard],
})
export class AuthModule {}
