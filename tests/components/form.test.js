const { 
    calculateEndTime, 
    handleFormSubmit, 
    showError 
} = require('@/components/form');

describe('Form Component', () => {
    let mockEvent;
    let mockSubmitButton;
    let mockSuccessAlert;
    let mockErrorAlert;
    let mockFormElements;

    beforeEach(() => {
        // Set up jest flag for test environment detection
        global.jest = true;
        if (typeof window === 'undefined') {
            global.window = {};
        }
        window.jest = true;
        
        // Mock form elements
        mockFormElements = {
            name: { value: 'John Doe' },
            email: { value: 'john@example.com' },
            phone: { value: '+1234567890' },
            numberOfPersons: { value: '2' },
            date: { value: '2024-03-20' },
            category: { value: 'lunch' },
            startTime: { value: '12:00' },
            notes: { value: 'Test notes' },
            preferredLanguage: { value: 'en' }
        };

        // Mock submit button with a real Jest mock for disabled property
        mockSubmitButton = {
            disabled: false,
            innerHTML: 'Submit'
        };
        
        // Use Object.defineProperty to make 'disabled' writable and trackable
        Object.defineProperty(mockSubmitButton, 'disabled', {
            get: jest.fn(() => false),
            set: jest.fn(value => {
                mockSubmitButton._disabled = value;
                return value;
            }),
            configurable: true
        });
        
        // Explicitly override the getter to return the current value
        jest.spyOn(mockSubmitButton, 'disabled', 'get').mockImplementation(() => 
            mockSubmitButton._disabled || false
        );

        mockSuccessAlert = {
            style: { display: 'none' }
        };

        mockErrorAlert = {
            style: { display: 'none' },
            innerHTML: '',
            querySelector: jest.fn().mockReturnValue({
                addEventListener: jest.fn()
            })
        };

        // Mock document.getElementById to return our form elements
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'submitButton': return mockSubmitButton;
                case 'successAlert': return mockSuccessAlert;
                case 'errorAlert': return mockErrorAlert;
                case 'name': return mockFormElements.name;
                case 'email': return mockFormElements.email;
                case 'phone': return mockFormElements.phone;
                case 'numberOfPersons': return mockFormElements.numberOfPersons;
                case 'date': return mockFormElements.date;
                case 'category': return mockFormElements.category;
                case 'startTime': return mockFormElements.startTime;
                case 'notes': return mockFormElements.notes;
                case 'preferredLanguage': return mockFormElements.preferredLanguage;
                default: return null;
            }
        });

        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };
        
        // Mock validation and other required functions
        window.validateReservationForm = jest.fn().mockReturnValue({ valid: true });
        window.displayValidationErrors = jest.fn();
        window.translate = jest.fn(key => key);
        window.isDebugEnvironment = jest.fn().mockReturnValue(false);
        window.generateUUID = jest.fn().mockReturnValue('test-uuid-123');
        window.checkAvailability = jest.fn();
        window.getCollectionName = jest.fn().mockReturnValue('reservations');

        // Clear localStorage and mock it
        if (window.localStorage) {
            window.localStorage.clear();
        }
    });

    describe('calculateEndTime', () => {
        test('should calculate correct end time for lunch', () => {
            expect(calculateEndTime('12:00', 'lunch')).toBe('13:20');
        });

        test('should calculate correct end time for dinner', () => {
            expect(calculateEndTime('19:00', 'dinner')).toBe('20:45');
        });

        test('should handle time rollover', () => {
            expect(calculateEndTime('23:30', 'dinner')).toBe('01:15');
        });
    });

    describe('handleFormSubmit', () => {
        test('should prevent default form submission', () => {
            handleFormSubmit(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        test('should hide previous alerts', () => {
            handleFormSubmit(mockEvent);
            expect(mockSuccessAlert.style.display).toBe('none');
            expect(mockErrorAlert.style.display).toBe('none');
        });

        test('should disable submit button during submission', () => {
            // Mock validateReservationForm to return valid
            window.validateReservationForm = jest.fn().mockReturnValue({ valid: true });
            
            // Mock functions.httpsCallable
            global.functions = {
                httpsCallable: jest.fn().mockReturnValue(() => Promise.resolve({ data: { available: true } }))
            };
            
            // The button should be disabled during submission process
            handleFormSubmit(mockEvent);
            
            // Check if setter was called with true
            expect(mockSubmitButton.disabled).toBe(true);
        });

        test('should handle validation failure', () => {
            // Override validateReservationForm to return invalid
            window.validateReservationForm = jest.fn().mockReturnValue({ 
                valid: false, 
                errors: { name: 'requiredField' } 
            });
            
            handleFormSubmit(mockEvent);
            expect(window.displayValidationErrors).toHaveBeenCalled();
            // Submit button should not be disabled with validation failure
            expect(mockSubmitButton.disabled).toBe(false);
        });
    });

    describe('showError', () => {
        test('should display error message', () => {
            const errorMessage = 'Test error message';
            showError(errorMessage);
            expect(mockErrorAlert.style.display).toBe('block');
            expect(mockErrorAlert.innerHTML).toContain(errorMessage);
        });

        test('should set up alert close button', () => {
            showError('Test error message');
            expect(mockErrorAlert.querySelector).toHaveBeenCalledWith('.alert-close');
        });
    });
});