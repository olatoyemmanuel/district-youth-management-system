import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { requestIdMiddleware } from '../src/common/http/request-id.middleware.js';
import { PrismaService } from '../src/database/prisma.service.js';

// Mock Prisma so these HTTP tests don't depend on a live PostgreSQL server.
const prismaMock = {
  $queryRaw: vi.fn(async () => [{ result: 1 }]),
};

describe('DYMS API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    prismaMock.$queryRaw.mockReset();
    prismaMock.$queryRaw.mockResolvedValue([{ result: 1 }]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(requestIdMiddleware);
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/ returns the standard success envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/')
      .expect(200);

    expect(response.body.data).toBe('Hello World!');
    expect(response.body.meta).toEqual({
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(response.headers['x-request-id']).toBe(
      response.body.meta.requestId,
    );
  });

  it('GET /api/v1/health returns the liveness payload in the success envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.data).toEqual({
      status: 'ok',
      service: 'dyms-api',
      timestamp: expect.any(String),
    });

    expect(new Date(response.body.data.timestamp).toISOString()).toBe(
      response.body.data.timestamp,
    );
    expect(response.body.meta.requestId).toBe(
      response.headers['x-request-id'],
    );
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it('GET /api/v1/health/ready reports database readiness', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200);

    expect(response.body.data).toEqual({
      status: 'ready',
      service: 'dyms-api',
      dependencies: {
        database: 'ok',
      },
      timestamp: expect.any(String),
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(new Date(response.body.data.timestamp).toISOString()).toBe(
      response.body.data.timestamp,
    );
  });

  it('GET /api/v1/health/ready returns a safe 503 error when the database query fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('Simulated database connection failure'),
    );

    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(503);

    expect(response.body.error).toEqual({
      code: 'REQUEST_FAILED',
      message: 'The request could not be completed.',
      details: [],
      requestId: response.headers['x-request-id'],
    });

    expect(JSON.stringify(response.body)).not.toContain(
      'Simulated database connection failure',
    );
  });

  it('returns the standard error envelope for requests that exceed the rate limit', async () => {
    const statuses: number[] = [];
    let lastResponse: request.Response | undefined;

    for (let index = 0; index < 101; index += 1) {
      lastResponse = await request(app.getHttpServer()).get(
        '/api/v1/health',
      );
      statuses.push(lastResponse.status);
    }

    expect(statuses.filter((status) => status === 200)).toHaveLength(100);
    expect(statuses[100]).toBe(429);
    expect(lastResponse?.body.error).toEqual({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too Many Requests',
      details: [],
      requestId: lastResponse?.headers['x-request-id'],
    });
  });
});
