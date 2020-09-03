module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: ['/schemas/', '/models/'],
  moduleFileExtensions: ['ts', 'js'],
  modulePaths: ['<rootDir>', '<rootDir>/src']
};
