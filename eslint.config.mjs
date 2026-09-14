import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import eslintReact from '@eslint-react/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const reactRuleNames = [
  '@eslint-react/jsx-no-children-prop',
  '@eslint-react/jsx-no-comment-textnodes',
  '@eslint-react/jsx-no-namespace',
  '@eslint-react/no-direct-mutation-state',
  '@eslint-react/no-duplicate-key',
  '@eslint-react/no-missing-key',
  '@eslint-react/dom-no-render-return-value',
  '@eslint-react/dom-no-unknown-property',
  '@eslint-react/dom-no-unsafe-target-blank',
];

export default [
  { ignores: ['node_modules/**', 'dist/**', '**/*.css', '**/*.scss'] },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: false, warnOnUnsupportedTypeScriptVersion: false },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['flat/recommended'][1].rules,
      ...tsPlugin.configs['flat/recommended'][2].rules,
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    plugins: { prettier },
    rules: {
      ...prettierConfig.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      curly: 'warn',
      'no-console': 'warn',
      'no-useless-assignment': 'off',
      'prettier/prettier': [
        'warn',
        { singleQuote: true, semi: true, tabWidth: 2, printWidth: 120, trailingComma: 'es5' },
      ],
    },
  },
  {
    files: ['src/**/*.{tsx,jsx}'],
    plugins: eslintReact.configs['recommended-typescript'].plugins,
    rules: Object.fromEntries(reactRuleNames.map((name) => [name, 'error'])),
  },
];
