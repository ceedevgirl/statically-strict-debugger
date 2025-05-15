import { defaults } from 'ts-jest/presets';

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    ...defaults.transform,
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
