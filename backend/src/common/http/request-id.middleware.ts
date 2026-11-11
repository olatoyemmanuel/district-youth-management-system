import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export type RequestWithId = Request & {
  requestId?: string;
};

/**
 * Assigns a server-generated correlation identifier to every HTTP request.
 * Client-provided identifiers are intentionally not trusted.
 */
export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const requestId = randomUUID();

  (request as RequestWithId).requestId = requestId;
  response.setHeader('X-Request-Id', requestId);

  next();
}
