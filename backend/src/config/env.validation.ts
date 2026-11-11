import { z } from 'zod';

/**
 * Validates environment variables used by the DYMS API.
 * Invalid configuration prevents startup.
 */
export const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().trim().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().url().refine(
      (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
      { message: 'DATABASE_URL must use the postgresql:// or postgres:// protocol' },
    ),
    RATE_LIMIT_TTL_MS: z.coerce.number().int().min(1000).max(86_400_000).default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100_000).default(100),
    CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
    AUTH_ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
    AUTH_CSRF_SECRET: z.string().min(32).optional(),
    AUTH_IDENTIFIER_HMAC_SECRET: z.string().min(32).optional(),
  })
  .superRefine((config, context) => {
    if (config.NODE_ENV !== 'production') return;

    for (const key of [
      'AUTH_ACCESS_TOKEN_SECRET',
      'AUTH_CSRF_SECRET',
      'AUTH_IDENTIFIER_HMAC_SECRET',
    ] as const) {
      if (!config[key]) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'This secret is required in production.',
        });
      }
    }

    if (!config.CORS_ALLOWED_ORIGINS.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ALLOWED_ORIGINS'],
        message: 'At least one explicit CORS origin is required in production.',
      });
    }

    if (config.TRUST_PROXY_HOPS < 1) {
      context.addIssue({
        code: 'custom',
        path: ['TRUST_PROXY_HOPS'],
        message: 'Configure the trusted HTTPS reverse-proxy hop count in production.',
      });
    }
  });

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  return environmentSchema.parse(config);
}
