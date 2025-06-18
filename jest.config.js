module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    './jest.setup.js'
  ],
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/html2canvas/dist/types/.+__mocks__',
    '<rootDir>/node_modules 2/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '\\.svg$': '<rootDir>/src/mocks/svgMock.js',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
      tsconfig: 'tsconfig.json',
    },
  },
  testTimeout: 10000,
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js'
  ],
}; 