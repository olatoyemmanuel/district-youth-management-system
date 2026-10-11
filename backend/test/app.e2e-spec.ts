import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';

// Mock Prisma so these HTTP tests don't depend on a live PostgreSQL server.
const prismaMock = {
  $queryRaw: vi.fn(async () => [{ result: 1 }]),
};

describe('DYMS API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    // Reset the database query mock to a healthy state for each test.
    prismaMock.$queryRaw.mockReset();
    prismaMock.$queryRaw.mockResolvedValue([{ result: 1 }]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();

    // Match the global API prefix configured by src/main.ts.
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterEach(async () => {
    // Close the application after each test to avoid leaking resources.
    await app.close();
  });

  it('GET /api/v1/ returns the initial root response', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /api/v1/health returns the liveness payload', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'dyms-api',
      timestamp: expect.any(String),
    });

    // Verify that the timestamp is a valid ISO-formatted date.
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );

    // Liveness should not need to query PostgreSQL.
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it('GET /api/v1/health/ready reports database readiness', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ready',
      service: 'dyms-api',
      dependencies: {
        database: 'ok',
      },
      timestamp: expect.any(String),
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );
  });

  it('GET /api/v1/health/ready returns 503 when the database query fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('Simulated database connection failure'),
    );

    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(503);

    // NestJS returns the custom exception response object directly.
    expect(response.body).toEqual({
      status: 'not_ready',
      service: 'dyms-api',
      dependencies: {
        database: 'unavailable',
      },
      timestamp: expect.any(String),
    });

    // Never expose the internal database error to API clients.
    expect(JSON.stringify(response.body)).not.toContain(
      'Simulated database connection failure',
    );

    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );
  });

  it('rejects requests that exceed the configured rate limit', async () => {
    const statuses: number[] = [];

    // A fresh app is created for this test, so the in-memory throttler
    // starts with a clean window. Send 101 requests against a limit of 100.
    for (let index = 0; index < 101; index += 1) {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/health',
      );

      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 200)).toHaveLength(100);
    expect(statuses[100]).toBe(429);
    expect(statuses.filter((status) => status === 429)).toHaveLength(1);
  });
});
