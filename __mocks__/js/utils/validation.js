// Mock validation functions
const validateReservationForm = jest.fn().mockImplementation(() => {
    return { valid: true };
});

const displayValidationErrors = jest.fn();

module.exports = {
    validateReservationForm,
    displayValidationErrors
}; 