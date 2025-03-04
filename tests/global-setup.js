// Global setup file for Jest
// This file runs once before all tests

// Clear all mocks and localStorage before all tests
beforeAll(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

// Reset mocks and localStorage after each test
afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
}); 