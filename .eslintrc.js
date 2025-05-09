module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['**/*.css', '**/*.scss'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'react', 'prettier', 'css', 'stylelint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        printWidth: 120,
        trailingComma: 'es5',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: ['*.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.css'],
      plugins: ['css'],
      extends: ['plugin:css/recommended'],
      rules: {
        'prettier/prettier': [
          'warn',
          {
            singleQuote: true,
            semi: true,
            tabWidth: 2,
            printWidth: 120,
          },
        ],
      },
    },
    {
      files: ['*.scss'],
      plugins: ['stylelint'],
      rules: {
        'prettier/prettier': [
          'warn',
          {
            singleQuote: true,
            semi: true,
            tabWidth: 2,
            printWidth: 120,
          },
        ],
      },
    },
  ],
};
