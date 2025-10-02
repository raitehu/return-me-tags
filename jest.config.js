const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^html-to-image$': '<rootDir>/test/__mocks__/html-to-image.ts',
    '^qrcode.react$': '<rootDir>/test/__mocks__/qrcode-react.tsx'
  }
};

module.exports = createJestConfig(customJestConfig);
