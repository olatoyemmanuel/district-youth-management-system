import {
  Injectable,
  Logger,
  TooManyRequestsException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

import { PrismaService } from '../database/prisma.service.js';
import { AccessTokenService } from './access-token.service.js';
import type { AuthActor, AuthCredentials } from './auth.types.js';
import { PasswordHasherService } from './password-hasher.service.js';

const INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;
const ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000;
const PRE_AUTH_MS = 10 * 60 * 1000;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function constantTimeBufferEqual(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

function boundedUserAgent(value: string | undefined): string | null {
  if (!value) return null;
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 512);
}

function asCount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  return 0;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly csrfSecret: string;
  private readonly identifierSecret: string;
  private readonly allowedOrigins: string[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly accessTokens: AccessTokenService,
    config: ConfigService,
  ) {
    this.csrfSecret = config.getOrThrow<string>('AUTH_CSRF_SECRET');
    this.identifierSecret = config.getOrThrow<string>(
      'AUTH_IDENTIFIER_HMAC_SECRET',
    );
    this.allowedOrigins = config
      .getOrThrow<string>('CORS_ALLOWED_ORIGINS')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  assertAllowedOrigin(origin: string | undefined): void {
    if (!origin || !this.allowedOrigins.includes(origin)) {
      throw new UnauthorizedException({
        code: 'REQUEST_ORIGIN_REJECTED',
        message: 'The request origin is not allowed.',
      });
    }
  }

  private csrfProof(scope: string): string {
    return createHmac('sha256', this.csrfSecret)
      .update(scope)
      .digest('base64url');
  }

  private verifyProof(expected: string, supplied: string | undefined): boolean {
    if (!supplied) return false;
    const left = Buffer.from(expected);
    const right = Buffer.from(supplied);
    return left.length === right.length && timingSafeEqual(left, right);
  }

  verifySessionCsrf(sessionId: string, supplied: string | undefined): void {
    if (!this.verifyProof(this.csrfProof(`session:${sessionId}`), supplied)) {
      throw new UnauthorizedException({
        code: 'CSRF_VALIDATION_FAILED',
        message: 'The request could not be validated.',
      });
    }
  }

  private identifierFingerprint(identifier: string): string {
    return createHmac('sha256', this.identifierSecret)
      .update(identifier)
      .digest('hex');
  }

  private async findValidPreAuthContext(cookieValue: string | null) {
    if (!cookieValue) return null;

    const separator = cookieValue.indexOf('.');
    if (separator <= 0) return null;

    const contextId = cookieValue.slice(0, separator);
    const secret = cookieValue.slice(separator + 1);
    if (!secret || secret.length < 32) return null;

    const context = await this.prisma.preAuthContext.findUnique({
      where: { id: contextId },
    });

    if (
      !context ||
      !context.secretDigest ||
      context.consumedAt ||
      context.revokedAt ||
      context.expiresAt <= new Date()
    ) {
      return null;
    }

    if (!constantTimeBufferEqual(context.secretDigest, sha256(secret))) {
      return null;
    }

    return { context, secret, contextId };
  }

  async issueCsrfContext(
    accessCookie: string | null,
    preAuthCookie: string | null,
  ): Promise<{
    csrfToken: string;
    preAuthCookie?: string;
    preAuthExpiresAt?: Date;
  }> {
    if (accessCookie) {
      const claims = this.accessTokens.verify(accessCookie);
      if (claims) {
        const session = await this.prisma.authSession.findFirst({
          where: {
            id: claims.sid,
            userAccountId: claims.sub,
            revokedAt: null,
            inactivityExpiresAt: { gt: new Date() },
            absoluteExpiresAt: { gt: new Date() },
            userAccount: { status: 'ACTIVE' },
          },
          select: { id: true },
        });

        if (session) {
          return { csrfToken: this.csrfProof(`session:${session.id}`) };
        }
      }
    }

    const existing = await this.findValidPreAuthContext(preAuthCookie);
    if (existing) {
      return {
        csrfToken: this.csrfProof(
          `preauth:${existing.contextId}:${existing.secret}`,
        ),
      };
    }

    const now = new Date();
    const expiresAt = addMilliseconds(now, PRE_AUTH_MS);
    const contextId = randomUUID();
    const secret = randomBytes(32).toString('base64url');

    await this.prisma.preAuthContext.create({
      data: {
        id: contextId,
        secretDigest: sha256(secret),
        createdAt: now,
        expiresAt,
        updatedAt: now,
      },
    });

    return {
      csrfToken: this.csrfProof(`preauth:${contextId}:${secret}`),
      preAuthCookie: `${contextId}.${secret}`,
      preAuthExpiresAt: expiresAt,
    };
  }

  private async verifyPreAuth(
    cookieValue: string | null,
    csrfToken: string | undefined,
  ): Promise<string> {
    const context = await this.findValidPreAuthContext(cookieValue);
    if (!context) {
      throw new UnauthorizedException({
        code: 'PRE_AUTH_CONTEXT_INVALID',
        message: 'Refresh the sign-in page and try again.',
      });
    }

    const expected = this.csrfProof(
      `preauth:${context.contextId}:${context.secret}`,
    );
    if (!this.verifyProof(expected, csrfToken)) {
      throw new UnauthorizedException({
        code: 'CSRF_VALIDATION_FAILED',
        message: 'The request could not be validated.',
      });
    }

    return context.contextId;
  }

  private async countRecentFailures(fingerprint: string): Promise<number> {
    const since = new Date(Date.now() - LOGIN_FAILURE_WINDOW_MS);
    const rows = await this.prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM audit_events AS failed
      WHERE failed.action = 'AUTH_LOGIN_FAILED'
        AND failed.occurred_at >= ${since}
        AND failed.safe_change_summary ->> 'identifierFingerprint' = ${fingerprint}
        AND failed.occurred_at > COALESCE(
          (
            SELECT MAX(succeeded.occurred_at)
            FROM audit_events AS succeeded
            WHERE succeeded.action = 'AUTH_LOGIN_SUCCEEDED'
              AND succeeded.safe_change_summary ->> 'identifierFingerprint' = ${fingerprint}
          ),
          '-infinity'::timestamptz
        )
    `;

    return asCount(rows[0]?.count);
  }

  private async recordAnonymousLoginFailure(
    fingerprint: string,
    correlationId: string | null,
  ): Promise<void> {
    await this.prisma.auditEvent.create({
      data: {
        id: randomUUID(),
        actorType: 'ANONYMOUS',
        action: 'AUTH_LOGIN_FAILED',
        targetType: 'ACCOUNT_IDENTIFIER',
        occurredAt: new Date(),
        correlationId,
        safeChangeSummary: { identifierFingerprint: fingerprint },
      },
    });
  }

  private async createCredentials(
    userAccount: { id: string; loginIdentifier: string; status: string },
    userAgent: string | undefined,
    correlationId: string | null,
    identifierFingerprint: string,
    preAuthContextId?: string,
  ): Promise<AuthCredentials> {
    const now = new Date();
    const absoluteExpiresAt = addMilliseconds(now, ABSOLUTE_MS);
    const inactivityExpiresAt = new Date(
      Math.min(now.getTime() + INACTIVITY_MS, absoluteExpiresAt.getTime()),
    );
    const sessionId = randomUUID();
    const refreshToken = randomBytes(32).toString('base64url');
    const accessToken = this.accessTokens.issue(userAccount.id, sessionId);

    await this.prisma.$transaction(async (tx) => {
      if (preAuthContextId) {
        const consumed = await tx.preAuthContext.updateMany({
          where: {
            id: preAuthContextId,
            consumedAt: null,
            revokedAt: null,
            expiresAt: { gt: now },
          },
          data: { consumedAt: now, updatedAt: now },
        });

        if (consumed.count !== 1) {
          throw new UnauthorizedException({
            code: 'PRE_AUTH_CONTEXT_INVALID',
            message: 'Refresh the sign-in page and try again.',
          });
        }
      }

      await tx.authSession.create({
        data: {
          id: sessionId,
          userAccountId: userAccount.id,
          createdAt: now,
          lastActivityAt: now,
          inactivityExpiresAt,
          absoluteExpiresAt,
          userAgentSummary: boundedUserAgent(userAgent),
        },
      });

      await tx.authSessionToken.create({
        data: {
          id: randomUUID(),
          authSessionId: sessionId,
          tokenHash: sha256(refreshToken).toString('hex'),
          tokenGeneration: 1,
          issuedAt: now,
        },
      });

      await tx.userAccount.update({
        where: { id: userAccount.id },
        data: { lastLoginAt: now },
      });

      await tx.auditEvent.create({
        data: {
          id: randomUUID(),
          actorType: 'USER',
          actorUserAccountId: userAccount.id,
          action: 'AUTH_LOGIN_SUCCEEDED',
          targetType: 'AUTH_SESSION',
          targetId: sessionId,
          occurredAt: now,
          correlationId,
          safeChangeSummary: { identifierFingerprint },
        },
      });
    });

    return {
      accessToken: accessToken.token,
      refreshToken,
      refreshExpiresAt: absoluteExpiresAt,
      csrfToken: this.csrfProof(`session:${sessionId}`),
      account: userAccount,
    };
  }

  async login(input: {
    loginIdentifier: string;
    password: string;
    preAuthCookie: string | null;
    csrfToken?: string;
    origin?: string;
    userAgent?: string;
    correlationId: string | null;
  }): Promise<AuthCredentials> {
    this.assertAllowedOrigin(input.origin);
    const preAuthContextId = await this.verifyPreAuth(
      input.preAuthCookie,
      input.csrfToken,
    );

    const fingerprint = this.identifierFingerprint(input.loginIdentifier);
    const recentFailures = await this.countRecentFailures(fingerprint);
    if (recentFailures >= MAX_LOGIN_FAILURES) {
      throw new TooManyRequestsException({
        code: 'RATE_LIMITED',
        message: 'Too many sign-in attempts. Try again later.',
      });
    }

    const account = await this.prisma.userAccount.findUnique({
      where: { loginIdentifier: input.loginIdentifier },
      select: {
        id: true,
        loginIdentifier: true,
        passwordHash: true,
        status: true,
      },
    });

    const passwordMatches = account
      ? await this.passwordHasher.verify(account.passwordHash, input.password)
      : (await this.passwordHasher.verifyDummy(input.password), false);

    if (!account || !passwordMatches || account.status !== 'ACTIVE') {
      await this.recordAnonymousLoginFailure(
        fingerprint,
        input.correlationId,
      );
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'The sign-in details are invalid.',
      });
    }

    return this.createCredentials(
      {
        id: account.id,
        loginIdentifier: account.loginIdentifier,
        status: account.status,
      },
      input.userAgent,
      input.correlationId,
      fingerprint,
      preAuthContextId,
    );
  }

  async refresh(input: {
    refreshToken: string | null;
    csrfToken?: string;
    origin?: string;
    correlationId: string | null;
    userAgent?: string;
  }): Promise<AuthCredentials> {
    this.assertAllowedOrigin(input.origin);

    if (!input.refreshToken) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const tokenHash = sha256(input.refreshToken).toString('hex');
    const token = await this.prisma.authSessionToken.findUnique({
      where: { tokenHash },
      include: {
        authSession: {
          include: { userAccount: true },
        },
      },
    });

    if (!token) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const session = token.authSession;
    this.verifySessionCsrf(session.id, input.csrfToken);

    if (token.consumedAt && !token.revokedAt) {
      await this.revokeForRefreshReuse(
        session.id,
        session.userAccountId,
        input.correlationId,
      );
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const now = new Date();
    if (
      token.revokedAt ||
      session.revokedAt ||
      session.inactivityExpiresAt <= now ||
      session.absoluteExpiresAt <= now ||
      session.userAccount.status !== 'ACTIVE'
    ) {
      await this.revokeSession(
        session.id,
        session.userAccountId,
        'SESSION_EXPIRED_OR_ACCOUNT_INACTIVE',
        input.correlationId,
      );
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const nextRefreshToken = randomBytes(32).toString('base64url');
    const nextAccessToken = this.accessTokens.issue(
      session.userAccountId,
      session.id,
    );
    const inactivityExpiresAt = new Date(
      Math.min(now.getTime() + INACTIVITY_MS, session.absoluteExpiresAt.getTime()),
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        const consumed = await tx.authSessionToken.updateMany({
          where: {
            id: token.id,
            consumedAt: null,
            revokedAt: null,
          },
          data: { consumedAt: now },
        });

        if (consumed.count !== 1) {
          throw new Error('REFRESH_ROTATION_RACE');
        }

        await tx.authSessionToken.create({
          data: {
            id: randomUUID(),
            authSessionId: session.id,
            tokenHash: sha256(nextRefreshToken).toString('hex'),
            tokenGeneration: token.tokenGeneration + 1,
            issuedAt: now,
          },
        });

        await tx.authSession.update({
          where: { id: session.id },
          data: {
            lastActivityAt: now,
            inactivityExpiresAt,
            userAgentSummary: boundedUserAgent(input.userAgent) ??
              session.userAgentSummary,
          },
        });

        await tx.auditEvent.create({
          data: {
            id: randomUUID(),
            actorType: 'USER',
            actorUserAccountId: session.userAccountId,
            action: 'AUTH_REFRESH_ROTATED',
            targetType: 'AUTH_SESSION',
            targetId: session.id,
            occurredAt: now,
            correlationId: input.correlationId,
          },
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'REFRESH_ROTATION_RACE') {
        await this.revokeForRefreshReuse(
          session.id,
          session.userAccountId,
          input.correlationId,
        );
        throw new UnauthorizedException({
          code: 'SESSION_INVALID',
          message: 'Your session is no longer valid. Sign in again.',
        });
      }
      throw error;
    }

    return {
      accessToken: nextAccessToken.token,
      refreshToken: nextRefreshToken,
      refreshExpiresAt: session.absoluteExpiresAt,
      csrfToken: this.csrfProof(`session:${session.id}`),
      account: {
        id: session.userAccount.id,
        loginIdentifier: session.userAccount.loginIdentifier,
        status: session.userAccount.status,
      },
    };
  }

  private async revokeForRefreshReuse(
    sessionId: string,
    userAccountId: string,
    correlationId: string | null,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.authSession.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: {
          revokedAt: now,
          revocationReason: 'REFRESH_TOKEN_REUSE_DETECTED',
        },
      });
      await tx.authSessionToken.updateMany({
        where: { authSessionId: sessionId, revokedAt: null },
        data: { revokedAt: now },
      });
      await tx.auditEvent.create({
        data: {
          id: randomUUID(),
          actorType: 'USER',
          actorUserAccountId: userAccountId,
          action: 'AUTH_REFRESH_REUSE_DETECTED',
          targetType: 'AUTH_SESSION',
          targetId: sessionId,
          occurredAt: now,
          correlationId,
          reason: 'A consumed refresh credential was presented again.',
        },
      });
    });
    this.logger.warn('Refresh-token reuse detected; session revoked.');
  }

  private async revokeSession(
    sessionId: string,
    userAccountId: string,
    reason: string,
    correlationId: string | null,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const changed = await tx.authSession.updateMany({
        where: { id: sessionId, userAccountId, revokedAt: null },
        data: { revokedAt: now, revocationReason: reason },
      });

      await tx.authSessionToken.updateMany({
        where: { authSessionId: sessionId, revokedAt: null },
        data: { revokedAt: now },
      });

      if (changed.count > 0) {
        await tx.auditEvent.create({
          data: {
            id: randomUUID(),
            actorType: 'USER',
            actorUserAccountId: userAccountId,
            action: 'AUTH_SESSION_REVOKED',
            targetType: 'AUTH_SESSION',
            targetId: sessionId,
            occurredAt: now,
            correlationId,
            reason,
          },
        });
      }
    });
  }

  async authenticateAccessToken(token: string): Promise<AuthActor> {
    const claims = this.accessTokens.verify(token);
    if (!claims) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const now = new Date();
    const session = await this.prisma.authSession.findFirst({
      where: {
        id: claims.sid,
        userAccountId: claims.sub,
        revokedAt: null,
        inactivityExpiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
        userAccount: { status: 'ACTIVE' },
      },
      select: {
        id: true,
        userAccountId: true,
        absoluteExpiresAt: true,
        userAccount: {
          select: { loginIdentifier: true, status: true },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    const inactivityExpiresAt = new Date(
      Math.min(now.getTime() + INACTIVITY_MS, session.absoluteExpiresAt.getTime()),
    );

    const touched = await this.prisma.authSession.updateMany({
      where: {
        id: session.id,
        userAccountId: session.userAccountId,
        revokedAt: null,
        inactivityExpiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
      },
      data: { lastActivityAt: now, inactivityExpiresAt },
    });

    if (touched.count !== 1) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'Your session is no longer valid. Sign in again.',
      });
    }

    return {
      userAccountId: session.userAccountId,
      sessionId: session.id,
      loginIdentifier: session.userAccount.loginIdentifier,
    };
  }

  async logout(
    actor: AuthActor,
    correlationId: string | null,
  ): Promise<void> {
    await this.revokeSession(
      actor.sessionId,
      actor.userAccountId,
      'USER_LOGOUT',
      correlationId,
    );
  }

  async logoutAll(
    actor: AuthActor,
    correlationId: string | null,
  ): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const changed = await tx.authSession.updateMany({
        where: { userAccountId: actor.userAccountId, revokedAt: null },
        data: { revokedAt: now, revocationReason: 'USER_LOGOUT_ALL' },
      });

      await tx.authSessionToken.updateMany({
        where: {
          authSession: { userAccountId: actor.userAccountId },
          revokedAt: null,
        },
        data: { revokedAt: now },
      });

      await tx.auditEvent.create({
        data: {
          id: randomUUID(),
          actorType: 'USER',
          actorUserAccountId: actor.userAccountId,
          action: 'AUTH_LOGOUT_ALL',
          targetType: 'USER_ACCOUNT',
          targetId: actor.userAccountId,
          occurredAt: now,
          correlationId,
        },
      });

      return changed.count;
    });
  }

  async listSessions(actor: AuthActor) {
    const now = new Date();
    const sessions = await this.prisma.authSession.findMany({
      where: {
        userAccountId: actor.userAccountId,
        revokedAt: null,
        inactivityExpiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        lastActivityAt: true,
        inactivityExpiresAt: true,
        absoluteExpiresAt: true,
        userAgentSummary: true,
      },
    });

    return sessions.map((session) => ({
      ...session,
      isCurrent: session.id === actor.sessionId,
    }));
  }

  async revokeOwnedSession(
    actor: AuthActor,
    sessionId: string,
    correlationId: string | null,
  ): Promise<void> {
    const session = await this.prisma.authSession.findFirst({
      where: { id: sessionId, userAccountId: actor.userAccountId },
      select: { id: true },
    });

    if (!session) {
      throw new UnauthorizedException({
        code: 'SESSION_INVALID',
        message: 'The requested session is unavailable.',
      });
    }

    await this.revokeSession(
      session.id,
      actor.userAccountId,
      'USER_REVOKED_SESSION',
      correlationId,
    );
  }
}
