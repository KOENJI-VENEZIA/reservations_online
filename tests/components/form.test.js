// Import form functions
import { 
    calculateEndTime, 
    handleFormSubmit, 
    showError 
} from '../../js/components/form.js';

// Mock validation module
jest.mock('../../js/utils/validation.js');

// Import mocked validation functions
import * as validation from '../../js/utils/validation.js';

describe('Form Component', () => {
    // Mock DOM elements
    let mockEvent, mockSubmitButton, mockSuccessAlert, mockErrorAlert;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup fake timers
        jest.useFakeTimers();
        
        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };
        
        // Mock DOM elements
        mockSubmitButton = {
            disabled: false,
            innerHTML: 'Submit'
        };
        
        mockSuccessAlert = {
            style: { display: 'block' },
            innerHTML: '',
            querySelector: jest.fn().mockReturnValue({
                addEventListener: jest.fn()
            }),
            scrollIntoView: jest.fn()
        };
        
        mockErrorAlert = {
            style: { display: 'block' },
            innerHTML: '',
            querySelector: jest.fn().mockReturnValue({
                addEventListener: jest.fn()
            })
        };
        
        // Mock document functions before tests
        document.getElementById = jest.fn(id => {
            switch (id) {
                case 'submitButton': return mockSubmitButton;
                case 'successAlert': return mockSuccessAlert;
                case 'errorAlert': return mockErrorAlert;
                case 'name': return { value: 'Test User' };
                case 'email': return { value: 'test@example.com' };
                case 'phone': return { value: '1234567890' };
                case 'numberOfPersons': return { value: '2' };
                case 'date': return { value: '2023-12-01' };
                case 'category': return { value: 'dinner' };
                case 'startTime': return { value: '19:00' };
                case 'notes': return { value: 'Test notes' };
                case 'preferredLanguage': return { value: 'en' };
                default: return null;
            }
        });
        
        // Mock document.createElement and document.querySelector
        document.createElement = jest.fn();
        document.querySelector = jest.fn();
        
        // Set up global functions that form.js might use
        global.jest = {};
        global.validateReservationForm = validation.validateReservationForm;
        global.displayValidationErrors = validation.displayValidationErrors;
    });
    
    describe('calculateEndTime', () => {
        test('should calculate correct end time for lunch', () => {
            const result = calculateEndTime('12:00', 'lunch');
            expect(result).toBe('13:20');
        });
        
        test('should calculate correct end time for dinner', () => {
            const result = calculateEndTime('19:00', 'dinner');
            expect(result).toBe('20:45');
        });
        
        test('should handle time rollover', () => {
            const result = calculateEndTime('23:30', 'dinner');
            expect(result).toBe('01:15');
        });
    });
    
    describe('handleFormSubmit', () => {
        test('should prevent default form submission', () => {
            // Set up validation to return valid result
            validation.validateReservationForm.mockReturnValue({ valid: true });
            
            handleFormSubmit(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });
        
        test('should hide previous alerts', () => {
            // Set up validation to return valid result
            validation.validateReservationForm.mockReturnValue({ valid: true });
            
            handleFormSubmit(mockEvent);
            expect(mockSuccessAlert.style.display).toBe('none');
            expect(mockErrorAlert.style.display).toBe('none');
        });
        
        test('should disable submit button during submission', () => {
            // Mock validateReservationForm to return valid
            validation.validateReservationForm.mockReturnValue({ valid: true });
            
            handleFormSubmit(mockEvent);
            expect(mockSubmitButton.disabled).toBe(true);
        });
        
        test('should handle validation failure', () => {
            // Mock validateReservationForm to return invalid
            validation.validateReservationForm.mockReturnValue({ 
                valid: false, 
                errors: { name: 'requiredField' } 
            });
            
            handleFormSubmit(mockEvent);
            expect(validation.displayValidationErrors).toHaveBeenCalled();
            // Submit button should not be disabled with validation failure
            expect(mockSubmitButton.disabled).toBe(false);
        });
    });
    
    describe('showError', () => {
        test('should display error message', () => {
            const errorMessage = 'Test error message';
            
            // Call the function
            showError(errorMessage);
            
            // Verify error alert was updated
            expect(mockErrorAlert.innerHTML).toContain(errorMessage);
            expect(mockErrorAlert.style.display).toBe('block');
        });
        
        test('should set up alert close button', () => {
            const errorMessage = 'Test error message';
            const mockCloseButton = { addEventListener: jest.fn() };
            
            // Mock querySelector to return a close button
            mockErrorAlert.querySelector.mockReturnValue(mockCloseButton);
            
            // Call the function
            showError(errorMessage);
            
            // Verify close button was set up
            expect(mockErrorAlert.querySelector).toHaveBeenCalledWith('.alert-close');
        });
    });
});

