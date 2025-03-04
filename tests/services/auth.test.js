const { 
    isAuthorizedAdmin, 
    addAdmin, 
    removeAdmin, 
    isValidEmail,
    initializeAuth 
} = require('@/services/auth');

describe('Authentication Services', () => {
    beforeEach(() => {
        // Reset localStorage before each test
        localStorage.clear();
        
        // Mock Firebase auth
        global.firebase = {
            auth: jest.fn().mockReturnValue({
                onAuthStateChanged: jest.fn().mockImplementation(callback => {
                    // Simulate no user signed in
                    callback(null);
                    return jest.fn(); // Return unsubscribe function
                })
            })
        };
        
        // Reset authorized admins
        global.authorizedAdmins = ['matteo.koenji@gmail.com'];
        
        // Initialize auth to set up the environment
        initializeAuth();
    });

    describe('isAuthorizedAdmin', () => {
        test('should return true for authorized admin email', () => {
            expect(isAuthorizedAdmin('matteo.koenji@gmail.com')).toBe(true);
        });

        test('should return false for unauthorized email', () => {
            expect(isAuthorizedAdmin('unauthorized@example.com')).toBe(false);
        });

        test('should handle case sensitivity', () => {
            expect(isAuthorizedAdmin('MATTEO.KOENJI@GMAIL.COM')).toBe(false);
        });
    });

    describe('addAdmin', () => {
        test('should add new admin to authorized list', () => {
            const newAdmin = 'newadmin@example.com';
            addAdmin(newAdmin);
            expect(authorizedAdmins).toContain(newAdmin);
        });

        test('should not add duplicate admin', () => {
            const existingAdmin = 'matteo.koenji@gmail.com';
            addAdmin(existingAdmin);
            expect(authorizedAdmins.filter(admin => admin === existingAdmin).length).toBe(1);
        });

        test('should persist admins to localStorage', () => {
            const newAdmin = 'newadmin@example.com';
            addAdmin(newAdmin);
            const savedAdmins = JSON.parse(localStorage.getItem('authorizedAdmins'));
            expect(savedAdmins).toContain(newAdmin);
        });
    });

    describe('removeAdmin', () => {
        test('should remove admin from authorized list', () => {
            const adminToRemove = 'matteo.koenji@gmail.com';
            removeAdmin(adminToRemove);
            expect(authorizedAdmins).not.toContain(adminToRemove);
        });

        test('should handle removing non-existent admin', () => {
            const nonExistentAdmin = 'nonexistent@example.com';
            removeAdmin(nonExistentAdmin);
            expect(authorizedAdmins).toEqual(['matteo.koenji@gmail.com']);
        });

        test('should update localStorage after removal', () => {
            const adminToRemove = 'matteo.koenji@gmail.com';
            removeAdmin(adminToRemove);
            const savedAdmins = JSON.parse(localStorage.getItem('authorizedAdmins'));
            expect(savedAdmins).not.toContain(adminToRemove);
        });
    });

    describe('isValidEmail', () => {
        test('should validate correct email formats', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.com')).toBe(true);
        });

        test('should reject invalid email formats', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });
}); 