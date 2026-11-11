import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import type { AuthenticatedRequest } from './access-token.guard.js';
import { AuthService } from './auth.service.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    this.authService.assertAllowedOrigin(request.headers.origin);
    if (!request.authActor) {
      throw new Error('CSRF guard requires AccessTokenGuard to run first.');
    }

    this.authService.verifySessionCsrf(
      request.authActor.sessionId,
      request.headers['x-csrf-token'],
    );

    return true;
  }
}
