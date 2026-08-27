import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // Match tsconfig baseUrl: "src" and the previous Jest modulePaths
    alias: {
      joiDescribeTypes: path.resolve(rootDir, 'src/joiDescribeTypes.ts')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/**/*.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/schemas/**', '**/interfaces/**', '**/AssertionCriteria.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'clover'],
      exclude: ['**/__tests__/**', '**/examples/**', ...coverageConfigDefaults.exclude]
    }
  }
});
