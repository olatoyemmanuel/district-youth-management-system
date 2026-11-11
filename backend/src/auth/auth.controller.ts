import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import type { Request, Response } from 'express';

import {
  ACCESS_COOKIE_NAME,
  PRE_AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  readCookie,
  writeAuthCookies,
  writePreAuthCookie,
} from './auth.cookies.js';
import { AccessTokenGuard, type AuthenticatedRequest } from './access-token.guard.js';
import { AuthService } from './auth.service.js';
import { CsrfGuard } from './csrf.guard.js';

const loginBodySchema = z
  .object({
    loginIdentifier: z.string().min(1).max(320),
    password: z.string().min(1).max(1024),
  })
  .strict();

@Controller('auth')
export class AuthController {
  private readonly secureCookies: boolean;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    this.secureCookies =
      config.get<string>('NODE_ENV', 'development') === 'production';
  }

  @Get('csrf')
  async getCsrf(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.issueCsrfContext(
      readCookie(request, ACCESS_COOKIE_NAME),
      readCookie(request, PRE_AUTH_COOKIE_NAME),
    );

    if (result.preAuthCookie && result.preAuthExpiresAt) {
      writePreAuthCookie(
        response,
        result.preAuthCookie,
        result.preAuthExpiresAt,
        this.secureCookies,
      );
    }

    return { csrfToken: result.csrfToken };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: unknown,
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Headers('origin') origin: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request & { requestId?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = loginBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid sign-in request.');
    }

    const credentials = await this.authService.login({
      ...parsed.data,
      preAuthCookie: readCookie(request, PRE_AUTH_COOKIE_NAME),
      csrfToken,
      origin,
      userAgent,
      correlationId: request.requestId ?? null,
    });

    writeAuthCookies(response, credentials, this.secureCookies);
    response.clearCookie(PRE_AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      path: '/api/v1/auth',
    });

    return {
      account: credentials.account,
      csrfToken: credentials.csrfToken,
      session: { expiresAt: credentials.refreshExpiresAt },
    };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async refresh(
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Headers('origin') origin: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request & { requestId?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const credentials = await this.authService.refresh({
      refreshToken: readCookie(request, REFRESH_COOKIE_NAME),
      csrfToken,
      origin,
      userAgent,
      correlationId: request.requestId ?? null,
    });

    writeAuthCookies(response, credentials, this.secureCookies);
    return {
      account: credentials.account,
      csrfToken: credentials.csrfToken,
      session: { expiresAt: credentials.refreshExpiresAt },
    };
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard, CsrfGuard)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(
      request.authActor!,
      request.requestId ?? null,
    );
    clearAuthCookies(response, this.secureCookies);
    return { revoked: true };
  }

  @Post('logout-all')
  @UseGuards(AccessTokenGuard, CsrfGuard)
  async logoutAll(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const revokedSessions = await this.authService.logoutAll(
      request.authActor!,
      request.requestId ?? null,
    );
    clearAuthCookies(response, this.secureCookies);
    return { revokedSessions };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async me(@Req() request: AuthenticatedRequest) {
    return {
      account: {
        id: request.authActor!.userAccountId,
        loginIdentifier: request.authActor!.loginIdentifier,
      },
      session: { id: request.authActor!.sessionId },
    };
  }

  @Get('sessions')
  @UseGuards(AccessTokenGuard)
  async sessions(@Req() request: AuthenticatedRequest) {
    return { sessions: await this.authService.listSessions(request.authActor!) };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AccessTokenGuard, CsrfGuard)
  async revokeSession(
    @Param('sessionId', new (class {
      transform(value: string): string {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
          throw new BadRequestException('Invalid session identifier.');
        }
        return value;
      }
    })()) sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.authService.revokeOwnedSession(
      request.authActor!,
      sessionId,
      request.requestId ?? null,
    );
    return { revoked: true };
  }
}
