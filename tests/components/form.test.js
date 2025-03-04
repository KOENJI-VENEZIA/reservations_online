const { 
    calculateEndTime, 
    handleFormSubmit, 
    showError 
} = require('../../../js/components/form');

describe('Form Component', () => {
    let mockEvent;
    let mockForm;
    let mockSubmitButton;
    let mockSuccessAlert;
    let mockErrorAlert;

    beforeEach(() => {
        // Mock DOM elements
        mockForm = {
            elements: {
                name: { value: 'John Doe' },
                email: { value: 'john@example.com' },
                phone: { value: '+1234567890' },
                numberOfPersons: { value: '2' },
                date: { value: '2024-03-20' },
                category: { value: 'lunch' },
                startTime: { value: '12:00' },
                notes: { value: 'Test notes' },
                preferredLanguage: { value: 'en' }
            }
        };

        mockSubmitButton = {
            disabled: false,
            innerHTML: 'Submit'
        };

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

        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'submitButton': return mockSubmitButton;
                case 'successAlert': return mockSuccessAlert;
                case 'errorAlert': return mockErrorAlert;
                default: return null;
            }
        });

        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };
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
        beforeEach(() => {
            // Mock validation functions
            window.validateReservationForm = jest.fn().mockReturnValue({ valid: true });
            window.displayValidationErrors = jest.fn();
            window.translate = jest.fn().mockReturnValue('Submitting...');
            window.functions = {
                httpsCallable: jest.fn().mockReturnValue({
                    then: jest.fn().mockReturnValue({
                        catch: jest.fn()
                    })
                })
            };
        });

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
            handleFormSubmit(mockEvent);
            expect(mockSubmitButton.disabled).toBe(true);
            expect(mockSubmitButton.innerHTML).toContain('Submitting...');
        });

        test('should handle validation failure', () => {
            window.validateReservationForm.mockReturnValue({ valid: false });
            handleFormSubmit(mockEvent);
            expect(window.displayValidationErrors).toHaveBeenCalled();
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