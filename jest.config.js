const isTruthy = obj => obj != null && obj !== false;

const isCI = process.env.CI === 'true';
const JEST_JUNIT_CONFIG = ['jest-junit', {
  output: 'test-results/results.xml',
  classNameTemplate: '{classname}-{title}',
  titleTemplate: '{classname}-{title}',
  ancestorSeparator: ' › ',
  usePathForSuiteName: 'true',
}];

module.exports = {
  testEnvironment: 'node',
  collectCoverage: false,
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: [
    '<rootDir>/docs/',
    'dist',
    'node_modules',
  ],
  watchPathIgnorePatterns: [
    'node_modules',
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  reporters: [
    'default',
    isCI && JEST_JUNIT_CONFIG,
  ].filter(isTruthy),
};
