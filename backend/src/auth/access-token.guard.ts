import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { readCookie, ACCESS_COOKIE_NAME } from './auth.cookies.js';
import type { AuthActor } from './auth.types.js';
import { AuthService } from './auth.service.js';

export type AuthenticatedRequest = Request & {
  authActor?: AuthActor;
  requestId?: string;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const token = readCookie(request, ACCESS_COOKIE_NAME);
    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        message: 'Sign in to continue.',
      });
    }

    request.authActor = await this.authService.authenticateAccessToken(token);
    return true;
  }
}
