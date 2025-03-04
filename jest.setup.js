// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

global.localStorage = localStorageMock;

// Mock window
const windowMock = {
  logToAdmin: jest.fn(),
};

Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: true
});

// Mock console
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
}; 