const { validateEmail, validateRequired, validateNumberOfPersons, validateDate } = require('@/utils/validation');

describe('Validation Utilities', () => {
    describe('validateEmail', () => {
        test('should validate correct email formats', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.com')).toBe(true);
        });

        test('should reject invalid email formats', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
            expect(validateEmail('user@')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validateRequired', () => {
        test('should validate non-empty strings', () => {
            expect(validateRequired('test')).toBe(true);
            expect(validateRequired('0')).toBe(true);
            expect(validateRequired(' ')).toBe(true);
        });

        test('should reject empty or null values', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });
    });

    describe('validateNumberOfPersons', () => {
        test('should validate correct number of persons', () => {
            expect(validateNumberOfPersons(2)).toBe(true);
            expect(validateNumberOfPersons(10)).toBe(true);
            expect(validateNumberOfPersons('2')).toBe(true);
        });

        test('should reject invalid number of persons', () => {
            expect(validateNumberOfPersons(1)).toBe(false);
            expect(validateNumberOfPersons(0)).toBe(false);
            expect(validateNumberOfPersons(-1)).toBe(false);
            expect(validateNumberOfPersons('invalid')).toBe(false);
        });
    });

    describe('validateDate', () => {
        test('should validate future dates', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(validateDate(tomorrow.toISOString().split('T')[0])).toEqual({ valid: true });
        });

        test('should reject past dates', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(validateDate(yesterday.toISOString().split('T')[0])).toEqual({ 
                valid: false, 
                reason: 'pastDate' 
            });
        });

        test('should reject Mondays', () => {
            const nextMonday = new Date();
            nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
            expect(validateDate(nextMonday.toISOString().split('T')[0])).toEqual({ 
                valid: false, 
                reason: 'monday' 
            });
        });

        test('should reject invalid date formats', () => {
            expect(validateDate('invalid-date')).toEqual({ 
                valid: false, 
                reason: 'invalidDate' 
            });
        });
    });
}); 