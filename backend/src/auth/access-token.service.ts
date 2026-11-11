import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

import type { AccessTokenClaims } from './auth.types.js';

const ACCESS_TOKEN_SECONDS = 15 * 60;

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

@Injectable()
export class AccessTokenService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET');
  }

  issue(userAccountId: string, sessionId: string): {
    token: string;
    expiresAt: Date;
  } {
    const now = Math.floor(Date.now() / 1000);
    const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload: AccessTokenClaims = {
      iss: 'dyms-api',
      sub: userAccountId,
      sid: sessionId,
      iat: now,
      exp: now + ACCESS_TOKEN_SECONDS,
      jti: randomUUID(),
    };
    const body = encode(JSON.stringify(payload));
    const signingInput = `${header}.${body}`;
    const signature = createHmac('sha256', this.secret)
      .update(signingInput)
      .digest('base64url');

    return {
      token: `${signingInput}.${signature}`,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  verify(token: string): AccessTokenClaims | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;
    if (!headerPart || !payloadPart || !signaturePart) return null;

    const signingInput = `${headerPart}.${payloadPart}`;
    const expected = createHmac('sha256', this.secret)
      .update(signingInput)
      .digest('base64url');

    if (!safeEqual(signaturePart, expected)) return null;

    try {
      const header = JSON.parse(
        Buffer.from(headerPart, 'base64url').toString('utf8'),
      ) as { alg?: string; typ?: string };

      const claims = JSON.parse(
        Buffer.from(payloadPart, 'base64url').toString('utf8'),
      ) as Partial<AccessTokenClaims>;

      const now = Math.floor(Date.now() / 1000);
      if (
        header.alg !== 'HS256' ||
        header.typ !== 'JWT' ||
        claims.iss !== 'dyms-api' ||
        typeof claims.sub !== 'string' ||
        typeof claims.sid !== 'string' ||
        typeof claims.iat !== 'number' ||
        typeof claims.exp !== 'number' ||
        typeof claims.jti !== 'string' ||
        claims.exp <= now ||
        claims.iat > now + 30
      ) {
        return null;
      }

      return claims as AccessTokenClaims;
    } catch {
      return null;
    }
  }
}
