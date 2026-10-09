import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';

describe('DYMS API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  });

  it('rejects requests that exceed the configured rate limit', async () => {
    const statuses: number[] = [];

    // A fresh app is created for this test, so the in-memory throttler
    // starts with a clean window. Send 101 requests against a limit of 100.
    for (let index = 0; index < 101; index += 1) {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health');

      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 200)).toHaveLength(100);
    expect(statuses[100]).toBe(429);
    expect(statuses.filter((status) => status === 429)).toHaveLength(1);
  });
});
