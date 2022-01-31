module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: ['/schemas/', '/interfaces/', 'AssertionCriteria'],
  moduleFileExtensions: ['ts', 'js'],
  modulePaths: ['<rootDir>', '<rootDir>/src'],
  coveragePathIgnorePatterns: ['__tests__', 'examples']
};
