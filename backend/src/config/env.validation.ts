import { z } from 'zod';

/**
 * Validates environment variables used by the DYMS API.
 *
 * Defaults support local development. Production deployments should
 * explicitly configure their environment rather than rely on defaults.
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
 *
 * Zod throws a descriptive validation error if any supplied value is
 * invalid. NestJS will then fail during application initialization.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  return environmentSchema.parse(config);
}
