import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', '.scratch/'],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Tags come from the typed constants in src/tags.ts, which this rule cannot evaluate.
      'playwright/valid-test-tags': 'off',
    },
  },
  {
    // Page objects and helpers must not sleep either; src/support/settled.ts is the one exception.
    files: ['src/**/*.ts'],
    plugins: { playwright },
    rules: { 'playwright/no-wait-for-timeout': 'error' },
  },
  prettier,
);
