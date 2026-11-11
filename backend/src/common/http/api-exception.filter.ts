import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import type { RequestWithId } from './request-id.middleware.js';

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: Array<{ message: string }>;
    requestId: string | null;
  };
};

function errorCodeForStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHENTICATED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMIT_EXCEEDED';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  }
}

function safeMessageForStatus(
  status: number,
  exceptionResponse: string | object | null,
): string {
  if (status >= 500) {
    return status === HttpStatus.SERVICE_UNAVAILABLE
      ? 'The service is temporarily unavailable.'
      : 'An unexpected error occurred.';
  }

  if (status === HttpStatus.TOO_MANY_REQUESTS) {
    return 'Too many requests. Please try again later.';
  }

  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }

  if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null &&
    'message' in exceptionResponse &&
    typeof exceptionResponse.message === 'string'
  ) {
    return exceptionResponse.message;
  }

  return 'The request could not be completed.';
}

/**
 * Normalizes HTTP failures without exposing internal exception details.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & RequestWithId>();
    const response = http.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const validationMessages =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.map((message: unknown) => ({
            message: String(message),
          }))
        : [];

    if (status >= 500) {
      this.logger.error(
        `Unhandled request failure (requestId=${request.requestId ?? 'unknown'})`,
      );
    }

    const body: ApiErrorBody = {
      error: {
        code: errorCodeForStatus(status),
        message: safeMessageForStatus(status, exceptionResponse),
        details: validationMessages,
        requestId: request.requestId ?? null,
      },
    };

    response.status(status).json(body);
  }
}
