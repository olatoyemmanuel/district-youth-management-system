import { defineConfig } from 'vitest/config';

/**
 * End-to-end test configuration.
 *
 * These tests exercise the NestJS application through its HTTP adapter.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
