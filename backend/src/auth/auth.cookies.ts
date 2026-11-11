import type { Request, Response } from 'express';

export const ACCESS_COOKIE_NAME = 'dyms_access';
export const REFRESH_COOKIE_NAME = 'dyms_refresh';
export const PRE_AUTH_COOKIE_NAME = 'dyms_pre_auth';

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;

  for (const item of header.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;

    const key = item.slice(0, separator).trim();
    if (key === name) {
      return item.slice(separator + 1).trim();
    }
  }

  return null;
}

export function writeAuthCookies(
  response: Response,
  credentials: {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
  },
  secure: boolean,
): void {
  const common = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
  };

  response.cookie(ACCESS_COOKIE_NAME, credentials.accessToken, {
    ...common,
    path: '/api/v1',
    maxAge: 15 * 60 * 1000,
  });

  response.cookie(REFRESH_COOKIE_NAME, credentials.refreshToken, {
    ...common,
    path: '/api/v1/auth',
    maxAge: Math.max(0, credentials.refreshExpiresAt.getTime() - Date.now()),
  });
}

export function writePreAuthCookie(
  response: Response,
  value: string,
  expiresAt: Date,
  secure: boolean,
): void {
  response.cookie(PRE_AUTH_COOKIE_NAME, value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

export function clearAuthCookies(response: Response, secure: boolean): void {
  const common = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
  };

  response.clearCookie(ACCESS_COOKIE_NAME, { ...common, path: '/api/v1' });
  response.clearCookie(REFRESH_COOKIE_NAME, {
    ...common,
    path: '/api/v1/auth',
  });
  response.clearCookie(PRE_AUTH_COOKIE_NAME, {
    ...common,
    path: '/api/v1/auth',
  });
}
