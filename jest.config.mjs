import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})
 
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/tests/', '<rootDir>/node_modules/', '<rootDir>/.next/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
}
 
export default createJestConfig(config)
