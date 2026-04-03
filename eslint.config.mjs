import { defineConfig, globalIgnores } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist', '**/.yarn', '**/.github', '**/.vscode']),
  {
    extends: compat.extends('plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'),

    plugins: {
      'unused-imports': unusedImports,
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
    },

    ignores: ['node_modules', 'dist', '.yarn', '.git', '.github', '.vscode'],

    rules: {
      'linebreak-style': ['error', 'unix'],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],

      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      indent: 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]);
