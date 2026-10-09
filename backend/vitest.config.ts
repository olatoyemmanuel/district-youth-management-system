import { defineConfig } from 'vitest/config';

/**
 * Unit-test configuration.
 *
 * Use Vite's native TypeScript path resolution instead of the deprecated
 * third-party plugin integration.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
