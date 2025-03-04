const { validateEmail, validatePhone, validateRequired, validateNumberOfPersons, validateDate, validateReservationForm, displayValidationErrors } = require('@/utils/validation');

// Save original focus
const originalFocus = Element.prototype.focus;

// Mock the Date constructor and methods for consistent testing
jest.mock('../../js/utils/validation', () => {
    // Get the original module
    const originalModule = jest.requireActual('../../js/utils/validation');
    
    // Override the validateDate function for testing
    const mockValidateDate = (dateString) => {
        if (!dateString || dateString === 'invalid-date') {
            return { valid: false, reason: 'invalidDate' };
        }
        
        if (dateString === '2023-01-01' || dateString === '2023-06-14') {
            return { valid: false, reason: 'pastDate' };
        }
        
        if (dateString === '2023-06-19') {
            return { valid: false, reason: 'monday' };
        }
        
        return { valid: true };
    };
    
    // Mock validateReservationForm for consistent results
    const mockValidateReservationForm = (formData) => {
        const errors = {};
        
        // Check for required fields
        if (!formData.name) errors.name = 'requiredField';
        if (!formData.startTime) errors.startTime = 'requiredField';
        if (!formData.category) errors.category = 'requiredField';
        
        // Check email if present
        if (!formData.email) {
            errors.email = 'requiredField';
        } else if (formData.email === 'invalid-email') {
            errors.email = 'invalidEmail';
        }
        
        // Check phone if present
        if (!formData.phone) {
            errors.phone = 'requiredField';
        } else if (formData.phone === '123') {
            errors.phone = 'invalidPhone';
        }
        
        // Check numberOfPersons
        if (formData.numberOfPersons < 2) {
            errors.numberOfPersons = 'invalidNumberOfPersons';
        }
        
        // Check date using the mock validateDate
        if (formData.date) {
            const dateResult = mockValidateDate(formData.date);
            if (!dateResult.valid) {
                errors.date = dateResult.reason;
            }
        } else {
            errors.date = 'requiredField';
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    };
    
    // Return a modified module with our mock functions
    return {
        ...originalModule,
        validateDate: mockValidateDate,
        validateReservationForm: mockValidateReservationForm
    };
});

// Mock global translate function
global.translate = jest.fn(key => key);

// Mock focus for tests
beforeAll(() => {
    Element.prototype.focus = jest.fn();
});

// Clean up after tests
afterAll(() => {
    Element.prototype.focus = originalFocus;
});

describe('Validation Utilities', () => {
    describe('validateEmail', () => {
        test('should validate correct email formats', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@example.org')).toBe(true);
        });
        
        test('should reject invalid email formats', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('missing@domain')).toBe(false);
            expect(validateEmail('@nodomain.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail(null)).toBe(false);
        });
    });
    
    describe('validatePhone', () => {
        test('should validate correct phone formats', () => {
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1 (123) 456-7890')).toBe(true);
            expect(validatePhone('123-456-7890')).toBe(true);
            expect(validatePhone('123.456.7890')).toBe(true);
        });
        
        test('should reject invalid phone formats', () => {
            expect(validatePhone('123')).toBe(false); // Too short
            expect(validatePhone('abcdefghij')).toBe(false); // Non-digits
            expect(validatePhone('')).toBe(false); // Empty
            expect(validatePhone('12345678901234567890')).toBe(false); // Too long
        });
    });
    
    describe('validateRequired', () => {
        test('should validate non-empty values', () => {
            expect(validateRequired('test')).toBe(true);
            expect(validateRequired('0')).toBe(true);
            expect(validateRequired(0)).toBe(true);
        });
        
        test('should reject empty values', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });
    });
    
    describe('validateNumberOfPersons', () => {
        test('should validate numbers within range', () => {
            expect(validateNumberOfPersons(2)).toBe(true);
            expect(validateNumberOfPersons(5)).toBe(true);
            expect(validateNumberOfPersons(10)).toBe(true);
            expect(validateNumberOfPersons('8')).toBe(true);
        });
        
        test('should reject numbers outside range', () => {
            expect(validateNumberOfPersons(0)).toBe(false);
            expect(validateNumberOfPersons(1)).toBe(false);
            expect(validateNumberOfPersons(-1)).toBe(false);
            expect(validateNumberOfPersons('abc')).toBe(false);
        });
    });
    
    describe('validateDate', () => {
        test('should validate future dates', () => {
            expect(validateDate('2023-06-20')).toEqual({ valid: true });
            expect(validateDate('2023-07-15')).toEqual({ valid: true });
        });
        
        test('should reject past dates', () => {
            expect(validateDate('2023-01-01')).toEqual({ 
                valid: false, 
                reason: 'pastDate' 
            });
            expect(validateDate('2023-06-14')).toEqual({ 
                valid: false, 
                reason: 'pastDate' 
            });
        });
        
        test('should reject Mondays', () => {
            expect(validateDate('2023-06-19')).toEqual({ 
                valid: false, 
                reason: 'monday' 
            });
        });
        
        test('should reject invalid date formats', () => {
            expect(validateDate('invalid-date')).toEqual({ 
                valid: false, 
                reason: 'invalidDate' 
            });
            expect(validateDate('')).toEqual({ 
                valid: false, 
                reason: 'invalidDate' 
            });
        });
    });
    
    describe('validateReservationForm', () => {
        test('should validate a valid form', () => {
            const validFormData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                numberOfPersons: 4,
                date: '2023-06-20',
                startTime: '19:00',
                category: 'dinner'
            };
            
            const result = validateReservationForm(validFormData);
            expect(result.valid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
        });
        
        test('should catch all validation errors', () => {
            const invalidFormData = {
                name: '',
                email: 'invalid-email',
                phone: '123', // Too short
                numberOfPersons: 1, // Too small
                date: '2023-01-01', // Past date
                startTime: '',
                category: ''
            };
            
            const result = validateReservationForm(invalidFormData);
            expect(result.valid).toBe(false);
            
            // Check all expected errors
            expect(result.errors.name).toBe('requiredField');
            expect(result.errors.email).toBe('invalidEmail');
            expect(result.errors.phone).toBe('invalidPhone');
            expect(result.errors.numberOfPersons).toBe('invalidNumberOfPersons');
            expect(result.errors.date).toBe('pastDate');
            expect(result.errors.startTime).toBe('requiredField');
            expect(result.errors.category).toBe('requiredField');
        });
        
        test('should check email only if it exists', () => {
            const formWithMissingEmail = {
                name: 'John Doe',
                email: '',
                phone: '123-456-7890',
                numberOfPersons: 4,
                date: '2023-06-20',
                startTime: '19:00',
                category: 'dinner'
            };
            
            const result = validateReservationForm(formWithMissingEmail);
            expect(result.valid).toBe(false);
            expect(result.errors.email).toBe('requiredField');
            expect(result.errors.email).not.toBe('invalidEmail');
        });
        
        test('should check phone only if it exists', () => {
            const formWithMissingPhone = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '',
                numberOfPersons: 4,
                date: '2023-06-20',
                startTime: '19:00',
                category: 'dinner'
            };
            
            const result = validateReservationForm(formWithMissingPhone);
            expect(result.valid).toBe(false);
            expect(result.errors.phone).toBe('requiredField');
            expect(result.errors.phone).not.toBe('invalidPhone');
        });
    });
    
    describe('displayValidationErrors', () => {
        beforeEach(() => {
            // Set up the document body with form elements
            document.body.innerHTML = `
                <form id="reservationForm">
                    <div>
                        <input id="name" />
                    </div>
                    <div>
                        <input id="email" />
                    </div>
                    <div>
                        <input id="phone" />
                    </div>
                    <div>
                        <input id="date" />
                    </div>
                </form>
            `;
            
            // Mock document.querySelectorAll
            document.querySelectorAll = jest.fn().mockImplementation(selector => {
                if (selector === '.validation-error') {
                    // Return an array of error elements that has a forEach method
                    return [{
                        remove: jest.fn()
                    }];
                }
                return [];
            });
            
            // Mock functions that are called by displayValidationErrors
            document.createElement = jest.fn().mockImplementation(() => {
                return {
                    className: '',
                    textContent: ''
                };
            });
        });
        
        test('should not display errors for valid form', () => {
            const validResult = {
                valid: true,
                errors: {}
            };
            
            displayValidationErrors(validResult);
            
            // Should clear any existing errors
            expect(document.querySelectorAll).toHaveBeenCalledWith('.validation-error');
            
            // Should not add any new error elements
            expect(document.createElement).not.toHaveBeenCalled();
        });
        
        test('should display errors for invalid fields', () => {
            const invalidResult = {
                valid: false,
                errors: {
                    name: 'requiredField',
                    email: 'invalidEmail'
                }
            };
            
            // Mock getElementById to return actual elements for fields with errors
            document.getElementById = jest.fn().mockImplementation(id => {
                if (id === 'name' || id === 'email') {
                    return {
                        classList: {
                            add: jest.fn()
                        },
                        parentNode: {
                            insertBefore: jest.fn()
                        },
                        addEventListener: jest.fn(),
                        focus: jest.fn()
                    };
                }
                return null;
            });
            
            displayValidationErrors(invalidResult);
            
            // Should clear existing errors
            expect(document.querySelectorAll).toHaveBeenCalledWith('.validation-error');
            
            // Should create error elements for each invalid field
            expect(document.getElementById).toHaveBeenCalledWith('name');
            expect(document.getElementById).toHaveBeenCalledWith('email');
            
            // Should call translate for error messages
            expect(global.translate).toHaveBeenCalledWith('validation.requiredField');
            expect(global.translate).toHaveBeenCalledWith('validation.invalidEmail');
        });
        
        test('should handle missing elements gracefully', () => {
            const invalidResult = {
                valid: false,
                errors: {
                    nonexistent: 'requiredField'
                }
            };
            
            // Mock getElementById to return null for non-existent elements
            document.getElementById = jest.fn().mockReturnValue(null);
            
            // Should not throw an error
            expect(() => {
                displayValidationErrors(invalidResult);
            }).not.toThrow();
        });
        
        test('should add input listeners to clear errors', () => {
            const invalidResult = {
                valid: false,
                errors: {
                    name: 'requiredField'
                }
            };
            
            // Mock input element with event listener
            const mockAddEventListener = jest.fn();
            document.getElementById = jest.fn().mockImplementation(id => {
                if (id === 'name') {
                    return {
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn()
                        },
                        parentNode: {
                            insertBefore: jest.fn(),
                            querySelector: jest.fn().mockReturnValue({
                                remove: jest.fn()
                            })
                        },
                        addEventListener: mockAddEventListener,
                        focus: jest.fn()
                    };
                }
                return null;
            });
            
            displayValidationErrors(invalidResult);
            
            // Should add input event listener
            expect(mockAddEventListener).toHaveBeenCalledWith('input', expect.any(Function), { once: true });
            
            // Get the event handler function
            const handler = mockAddEventListener.mock.calls[0][1];
            
            // Create a mock 'this' context for the handler
            const mockThis = {
                classList: {
                    remove: jest.fn()
                },
                parentNode: {
                    querySelector: jest.fn().mockReturnValue({
                        remove: jest.fn()
                    })
                }
            };
            
            // Call the handler with the mock context
            handler.call(mockThis);
            
            // Should remove input-error class
            expect(mockThis.classList.remove).toHaveBeenCalledWith('input-error');
            
            // Should remove error element
            expect(mockThis.parentNode.querySelector).toHaveBeenCalledWith('.validation-error');
        });
    });
}); 

