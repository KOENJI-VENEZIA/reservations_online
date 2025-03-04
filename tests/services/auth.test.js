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
        // Reset authorized admins
        window.authorizedAdmins = ['matteo.koenji@gmail.com'];
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
            expect(window.authorizedAdmins).toContain(newAdmin);
        });

        test('should not add duplicate admin', () => {
            const existingAdmin = 'matteo.koenji@gmail.com';
            addAdmin(existingAdmin);
            expect(window.authorizedAdmins.filter(admin => admin === existingAdmin).length).toBe(1);
        });

        test('should persist admins to localStorage', () => {
            const newAdmin = 'newadmin@example.com';
            addAdmin(newAdmin);
            expect(JSON.parse(localStorage.getItem('authorizedAdmins'))).toContain(newAdmin);
        });
    });

    describe('removeAdmin', () => {
        test('should remove admin from authorized list', () => {
            const adminToRemove = 'matteo.koenji@gmail.com';
            removeAdmin(adminToRemove);
            expect(window.authorizedAdmins).not.toContain(adminToRemove);
        });

        test('should handle removing non-existent admin', () => {
            const nonExistentAdmin = 'nonexistent@example.com';
            removeAdmin(nonExistentAdmin);
            expect(window.authorizedAdmins).toEqual(['matteo.koenji@gmail.com']);
        });

        test('should update localStorage after removal', () => {
            const adminToRemove = 'matteo.koenji@gmail.com';
            removeAdmin(adminToRemove);
            expect(JSON.parse(localStorage.getItem('authorizedAdmins'))).not.toContain(adminToRemove);
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

    describe('initializeAuth', () => {
        beforeEach(() => {
            // Mock localStorage
            localStorage.setItem('authorizedAdmins', JSON.stringify(['test@example.com']));
        });

        test('should load authorized admins from localStorage', () => {
            initializeAuth();
            expect(window.authorizedAdmins).toContain('test@example.com');
        });

        test('should expose auth functions to window', () => {
            initializeAuth();
            expect(window.isAuthorizedAdmin).toBeDefined();
            expect(window.addAdmin).toBeDefined();
            expect(window.removeAdmin).toBeDefined();
            expect(window.signOut).toBeDefined();
            expect(window.getCurrentUser).toBeDefined();
        });
    });
}); 