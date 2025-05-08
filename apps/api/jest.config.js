module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.e2e.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}; 