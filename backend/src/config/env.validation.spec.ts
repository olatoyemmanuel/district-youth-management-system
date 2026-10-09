import {
  environmentSchema,
  validateEnvironment,
} from './env.validation.js';

describe('DYMS environment validation', () => {
  it('provides safe defaults for local development', () => {
    const config = validateEnvironment({});

    expect(config).toEqual({
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 3000,
      RATE_LIMIT_TTL_MS: 60_000,
      RATE_LIMIT_MAX: 100,
    });
  });

  it('converts valid numeric environment values', () => {
    const config = validateEnvironment({
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: '3100',
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
        PORT: '70000',
      }),
    ).toThrow();
  });

  it('rejects a non-numeric port', () => {
    expect(() =>
      environmentSchema.parse({
        PORT: 'not-a-port',
      }),
    ).toThrow();
  });

  it('rejects an unsupported environment name', () => {
    expect(() =>
      environmentSchema.parse({
        NODE_ENV: 'staging',
      }),
    ).toThrow();
  });

  it('rejects invalid rate-limit values', () => {
    expect(() =>
      environmentSchema.parse({
        RATE_LIMIT_MAX: '0',
      }),
    ).toThrow();

    expect(() =>
      environmentSchema.parse({
        RATE_LIMIT_TTL_MS: '500',
      }),
    ).toThrow();
  });
});
