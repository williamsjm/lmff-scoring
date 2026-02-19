import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import react from 'eslint-plugin-react'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import unusedImports from 'eslint-plugin-unused-imports'
import importX from 'eslint-plugin-import-x'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...tanstackQuery.configs['flat/recommended'],
    ],
    plugins: {
      react,
      'unused-imports': unusedImports,
      'import-x': importX,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Console
      'no-console': 'warn',

      // Arrow functions — evitar llaves innecesarias
      'arrow-body-style': ['warn', 'as-needed'],

      // React
      'react/react-in-jsx-scope': 'off',          // React 17+ JSX transform
      'react/self-closing-comp': 'warn',           // <Foo /> en vez de <Foo></Foo>
      'react/jsx-no-useless-fragment': 'warn',     // <>x</> innecesarios
      'react/no-unstable-nested-components': 'error', // no definir componentes dentro de render

      // Imports
      'unused-imports/no-unused-imports': 'error',
      'import-x/no-duplicates': 'warn',
      'import-x/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
])
