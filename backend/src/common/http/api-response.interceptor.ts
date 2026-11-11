import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { map, Observable } from 'rxjs';

import type { RequestWithId } from './request-id.middleware.js';

type ApiSuccess<T> = {
  data: T;
  meta: {
    requestId: string | null;
    timestamp: string;
  };
};

/**
 * Applies the DFR-002 success response envelope to API responses.
 */
@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccess<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<Request & RequestWithId>();

    return next.handle().pipe(
      map((data: unknown) => ({
        data,
        meta: {
          requestId: request.requestId ?? null,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
