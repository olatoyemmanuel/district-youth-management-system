import { z } from 'zod';

/**
 * Validates environment variables used by the DYMS API.
 *
 * Database connectivity is mandatory. Other local-development defaults
 * remain available, while production should configure values explicitly.
 */
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  HOST: z.string().trim().min(1).default('0.0.0.0'),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000),

  // Require a valid PostgreSQL connection URL without exposing its password.
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) =>
        value.startsWith('postgresql://') ||
        value.startsWith('postgres://'),
      {
        message:
          'DATABASE_URL must use the postgresql:// or postgres:// protocol',
      },
    ),

  RATE_LIMIT_TTL_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(86_400_000)
    .default(60_000),

  RATE_LIMIT_MAX: z.coerce
    .number()
    .int()
    .min(1)
    .max(100_000)
    .default(100),
});

/**
 * Validates and normalizes the environment variables loaded by NestJS.
 * Invalid configuration prevents the application from starting.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  return environmentSchema.parse(config);
}
