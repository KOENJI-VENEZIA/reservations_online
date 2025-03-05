module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1',
  },
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      functions: 40,
    },
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  fakeTimers: {
    enableGlobally: true,
  }
}; 