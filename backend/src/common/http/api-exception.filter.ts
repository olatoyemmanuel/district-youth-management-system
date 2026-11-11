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
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  }
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

    const safeMessage =
      status >= 500
        ? 'An unexpected error occurred.'
        : typeof exceptionResponse === 'string'
          ? exceptionResponse
          : typeof exceptionResponse === 'object' &&
              exceptionResponse !== null &&
              'message' in exceptionResponse &&
              typeof exceptionResponse.message === 'string'
            ? exceptionResponse.message
            : 'The request could not be completed.';

    if (status >= 500) {
      this.logger.error(
        `Unhandled request failure (requestId=${request.requestId ?? 'unknown'})`,
      );
    }

    const body: ApiErrorBody = {
      error: {
        code: errorCodeForStatus(status),
        message: safeMessage,
        details: validationMessages,
        requestId: request.requestId ?? null,
      },
    };

    response.status(status).json(body);
  }
}
