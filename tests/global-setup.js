// Global setup file for Jest
// This file runs once before all tests

// Clear all mocks and localStorage before all tests
beforeAll(() => {
    jest.clearAllMocks();
    if (window.localStorage) {
        window.localStorage.clear();
    }
    
    // Create a global authorizedAdmins array if needed by tests
    if (!global.authorizedAdmins) {
        global.authorizedAdmins = ['matteo.koenji@gmail.com'];
    }
});

// Reset mocks and localStorage after each test
afterEach(() => {
    jest.clearAllMocks();
    if (window.localStorage) {
        window.localStorage.clear();
    }
});

// Clean up after all tests
afterAll(() => {
    jest.restoreAllMocks();
});