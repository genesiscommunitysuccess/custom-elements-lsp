module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-import', 'unused-imports'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  root: true,
  extends: ['google', 'plugin:prettier/recommended', 'plugin:import/typescript'],
  ignorePatterns: [
    'custom-elements-manifest.config.js',
    'commitlint.config.js',
    '.eslintrc.js',
    '**/dist/**/*',
    '**/public/**/*',
    '**/out/**/*',
    '**/node_modules/**/*',
    'scripts/**/*',
		'**/polyfill.ts'
  ],
  settings: {
    'import/resolver': {
      node: false,
      typescript: true,
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
  },
  rules: {
    'jsx-quotes': ['error', 'prefer-double'],
    'valid-jsdoc': 'off',
    'require-jsdoc': 'off',
    'linebreak-style': 0,
    // `h` in particular is "unused" but used in the built rendering
    'no-unused-vars': 'off',
    // Stencil's output throws this off given the multiple contexts
    'no-invalid-this': 'off',
    // Decorators in TypeScript throw this off
    'new-cap': 'off',
    // Custom max length from Google's recommendation
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 4,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'eol-last': ['error', 'always'],
    'require-await': ['off'],
    'require-yield': ['error'],
    'no-async-promise-executor': ['error'],
    'no-await-in-loop': ['error'],
    'require-atomic-updates': ['error'],
    complexity: ['error', { max: 20 }],
    'max-depth': ['error', { max: 4 }],
    'prefer-promise-reject-errors': ['error'],
    'no-throw-literal': ['error'],
    'no-promise-executor-return': ['error'],
    'no-sparse-arrays': ['error'],
    'no-unreachable-loop': ['error'],
    'no-unsafe-optional-chaining': ['error'],
    'no-lone-blocks': ['error'],
    '@typescript-eslint/no-magic-numbers': [
      'warn',
      {
        detectObjects: false,
        ignoreDefaultValues: true,
        ignoreArrayIndexes: true,
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreReadonlyClassProperties: true,
        ignore: [-1, 0, 2, 1, 100, 9000],
      },
    ],
    'no-unmodified-loop-condition': ['error'],
    'no-useless-call': ['error'],
    'prefer-named-capture-group': ['off'],
    'no-shadow': ['off'],
    '@typescript-eslint/no-shadow': ['error'],
    'no-shadow-restricted-names': ['error'],
    'no-use-before-define': 'off',
    'no-plusplus': ['error'],
    'guard-for-in': ['error'],
    'no-return-await': ['error'],
    'padded-blocks': 'off',
    'unused-imports/no-unused-imports': ['warn'],
    'import/imports-first': ['error', 'absolute-first'],
    'import/namespace': ['error', { allowComputed: true }],
    'import/newline-after-import': ['error'],
    'import/no-absolute-path': ['error'],
    'import/no-mutable-exports': ['error'],
    'import/no-extraneous-dependencies': ['error'],
    'import/no-unresolved': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
  overrides: [
    {
      files: ['*.styles.ts', '*.test.ts', 'webpack.config.js'],
      rules: {
        '@typescript-eslint/no-magic-numbers': ['off'],
      },
    },
    {
      files: ['*.js'],
      rules: {
        'import/no-extraneous-dependencies': ['off'],
      },
    },
  ],
};
