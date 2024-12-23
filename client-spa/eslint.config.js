import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default tseslint.config(
  {
    settings: {
      react: {
        version: 'detect'
      }
    },
    ignores: ['dist']
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        project: "tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true
      }],
      '@typescript-eslint/dot-notation': ['error', {
        allowKeywords: true,
        allowPrivateClassPropertyAccess: false,
        allowProtectedClassPropertyAccess: false,
        allowIndexSignaturePropertyAccess: false
      }],
      '@typescript-eslint/no-empty-function': ['error', {
        allow: [
          'arrowFunctions',
          'functions',
          'methods',
          'private-constructors',
          'protected-constructors',
          'decoratedFunctions'
        ]
      }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-floating-promises': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
)