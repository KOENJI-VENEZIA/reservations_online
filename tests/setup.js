// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Create proper localStorage mock
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        length: 0,
        key: jest.fn(),
    };
})();

// Apply localStorage mock
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Mock Firebase
global.firebase = {
    firestore: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
                set: jest.fn().mockResolvedValue({}),
                get: jest.fn().mockResolvedValue({})
            }),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({
                forEach: jest.fn()
            })
        })
    }),
    functions: jest.fn().mockReturnValue({
        httpsCallable: jest.fn().mockReturnValue(() => Promise.resolve({ data: {} }))
    }),
    auth: jest.fn().mockReturnValue({
        onAuthStateChanged: jest.fn(),
        signInWithPopup: jest.fn(),
        signOut: jest.fn().mockResolvedValue({})
    })
};

// Mock db and functions
global.db = {
    collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({})
        }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            forEach: jest.fn()
        })
    })
};

global.functions = {
    httpsCallable: jest.fn().mockReturnValue(() => Promise.resolve({ data: { available: true } }))
};

// Add other utility functions that are used in tests
global.translate = jest.fn(key => key);
global.isDebugEnvironment = jest.fn().mockReturnValue(false);
global.getCollectionName = jest.fn().mockReturnValue('reservations');
global.generateUUID = jest.fn().mockReturnValue('test-uuid-123');

// Mock document functions
document.getElementById = jest.fn();
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn().mockReturnValue([]);
document.createElement = jest.fn().mockReturnValue({
    addEventListener: jest.fn(),
    appendChild: jest.fn()
});