module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[t]s?(x)'],
  transform: {
    '^.+\\.test.ts$': [
      'ts-jest',
      {
        tsconfig: './test/tsconfig.jest.json',
      },
    ],
  },
};
