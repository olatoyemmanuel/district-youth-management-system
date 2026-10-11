import {
  environmentSchema,
  validateEnvironment,
} from './env.validation.js';

const TEST_DATABASE_URL =
  'postgresql://dyms_user:test-password@127.0.0.1:5432/dyms?schema=public';

describe('DYMS environment validation', () => {
  it('provides local-development defaults when the database URL is supplied', () => {
    const config = validateEnvironment({
      DATABASE_URL: TEST_DATABASE_URL,
    });

    expect(config).toEqual({
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 3000,
      DATABASE_URL: TEST_DATABASE_URL,
      RATE_LIMIT_TTL_MS: 60_000,
      RATE_LIMIT_MAX: 100,
    });
  });

  it('requires a database URL', () => {
    expect(() => environmentSchema.parse({})).toThrow();
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: 'mysql://user:password@localhost:3306/dyms',
      }),
    ).toThrow();
  });

  it('converts valid numeric environment values', () => {
    const config = validateEnvironment({
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: '3100',
      DATABASE_URL: TEST_DATABASE_URL,
      RATE_LIMIT_TTL_MS: '30000',
      RATE_LIMIT_MAX: '25',
    });

    expect(config.PORT).toBe(3100);
    expect(config.RATE_LIMIT_TTL_MS).toBe(30_000);
    expect(config.RATE_LIMIT_MAX).toBe(25);
  });

  it('rejects a port outside the valid range', () => {
    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: TEST_DATABASE_URL,
        PORT: '70000',
      }),
    ).toThrow();
  });

  it('rejects a non-numeric port', () => {
    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: TEST_DATABASE_URL,
        PORT: 'not-a-port',
      }),
    ).toThrow();
  });

  it('rejects an unsupported environment name', () => {
    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: TEST_DATABASE_URL,
        NODE_ENV: 'staging',
      }),
    ).toThrow();
  });

  it('rejects invalid rate-limit values', () => {
    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: TEST_DATABASE_URL,
        RATE_LIMIT_MAX: '0',
      }),
    ).toThrow();

    expect(() =>
      environmentSchema.parse({
        DATABASE_URL: TEST_DATABASE_URL,
        RATE_LIMIT_TTL_MS: '500',
      }),
    ).toThrow();
  });
});
