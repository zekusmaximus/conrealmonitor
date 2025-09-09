import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
export default [
  {
    ignores: [
      'webroot',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'eslint.config.js',
      '**/vite.config.ts',
      'devvit.config.ts',
    ],
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node,
        ...globals.browser,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'typescript-eslint/no-floating-promises': 'error',
      'typescript-eslint/no-unused-vars': ['off'],
      'no-unused-vars': ['off'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./src/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
