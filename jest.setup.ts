import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

Object.defineProperty(window.HTMLAnchorElement.prototype, 'click', {
  configurable: true,
  value: jest.fn(),
});
