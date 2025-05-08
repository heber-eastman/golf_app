module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: 'tsconfig.json'
    }]
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  // Temporarily disable coverage thresholds
  // coverageThreshold: {
  //   global: {
  //     statements: 80,
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //   },
  // },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@golf-app/common$': '<rootDir>/../../packages/common/dist'
  },
  testTimeout: 30000,
  verbose: true,
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '.',
      outputName: 'jest-results.json',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 