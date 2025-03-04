const { 
    isAuthorizedAdmin, 
    addAdmin, 
    removeAdmin
} = require('@/services/auth');

// Mock firebase
const mockAuthStateChanged = jest.fn();
const mockUser = {
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
};

const mockSignInWithPopup = jest.fn().mockResolvedValue({ user: mockUser });
const mockSignOut = jest.fn().mockResolvedValue();

global.firebase = {
    auth: jest.fn().mockReturnValue({
        onAuthStateChanged: mockAuthStateChanged,
        signInWithPopup: mockSignInWithPopup,
        signOut: mockSignOut
    }),
    auth: {
        GoogleAuthProvider: jest.fn()
    }
};

// Setup for DOM elements
function setupMockDOM() {
    document.body.innerHTML = `
        <div id="adminLoginSection" style="display: flex;"></div>
        <div id="adminContent" style="display: none;"></div>
        <div id="userAvatar"></div>
        <div id="userName"></div>
        <div id="userEmail"></div>
        <div id="adminList"></div>
        <input id="newAdminEmail" value="new@example.com" />
    `;
}

describe('Authentication Service', () => {
    // Setup before each test
    beforeEach(() => {
        // Reset localStorage for testing
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        }
        
        // Setup jest globals
        global.jest = true;
        global.authorizedAdmins = ['test@example.com'];
        global.translate = jest.fn(key => key);
        global.alert = jest.fn();
        global.showConfirmationModal = jest.fn((message, callback) => callback());
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup mock DOM
        setupMockDOM();
    });

    describe('isAuthorizedAdmin', () => {
        test('should return true for authorized admin email', () => {
            expect(isAuthorizedAdmin('test@example.com')).toBe(true);
        });

        test('should return false for unauthorized email', () => {
            expect(isAuthorizedAdmin('unauthorized@example.com')).toBe(false);
        });

        test('should handle case sensitivity', () => {
            expect(isAuthorizedAdmin('TEST@example.com')).toBe(false);
        });
    });

    describe('addAdmin', () => {
        test('should add new admin to authorized list', () => {
            addAdmin('newadmin@example.com');
            expect(global.authorizedAdmins).toContain('newadmin@example.com');
        });

        test('should not add duplicate admin', () => {
            addAdmin('test@example.com');
            expect(global.authorizedAdmins.filter(email => email === 'test@example.com').length).toBe(1);
        });

        test('should not add invalid email', () => {
            const initialLength = global.authorizedAdmins.length;
            addAdmin('invalid-email');
            expect(global.authorizedAdmins.length).toBe(initialLength);
        });

        test('should not add empty email', () => {
            const initialLength = global.authorizedAdmins.length;
            addAdmin('');
            expect(global.authorizedAdmins.length).toBe(initialLength);
        });
    });

    describe('removeAdmin', () => {
        test('should remove admin from authorized list', () => {
            addAdmin('removeme@example.com');
            removeAdmin('removeme@example.com');
            expect(global.authorizedAdmins).not.toContain('removeme@example.com');
        });

        test('should handle removing non-existent admin', () => {
            const initialLength = global.authorizedAdmins.length;
            removeAdmin('nonexistent@example.com');
            expect(global.authorizedAdmins.length).toBe(initialLength);
        });
    });
}); 

