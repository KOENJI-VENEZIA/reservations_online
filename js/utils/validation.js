// Form validation utilities

// Validate email format
export function validateEmail(email) {
    if (email === null || email === undefined) {
        return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

// Validate phone number (basic format check)
export function validatePhone(phone) {
    // Remove common formatting characters
    const stripped = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Check if it has a reasonable length and contains only digits
    // This is a simple validation - you may want to adjust for country-specific formats
    const re = /^\+?\d{7,15}$/;
    return re.test(stripped);
}

// Validate required fields
export function validateRequired(value) {
    return value !== null && value !== undefined && value.toString() !== '';
}

// Validate number of persons (minimum 2)
export function validateNumberOfPersons(number) {
    const num = parseInt(number);
    return !isNaN(num) && num >= 2;
}

// Validate date (not in the past and not on Monday)
export function validateDate(dateString) {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to beginning of day
    
    // Check if date is valid
    if (!(selectedDate instanceof Date && !isNaN(selectedDate))) {
        return { valid: false, reason: 'invalidDate' };
    }
    
    // Check if date is not in the past
    if (selectedDate < today) {
        return { valid: false, reason: 'pastDate' };
    }
    
    // Check if date is not a Monday (getDay() returns 1 for Monday)
    if (selectedDate.getDay() === 1) {
        return { valid: false, reason: 'monday' };
    }
    
    return { valid: true };
}

// Validate entire reservation form
export function validateReservationForm(formData) {
    const errors = {};
    
    // Validate name
    if (!validateRequired(formData.name)) {
        errors.name = 'requiredField';
    }
    
    // Validate email
    if (!validateRequired(formData.email)) {
        errors.email = 'requiredField';
    } else if (!validateEmail(formData.email)) {
        errors.email = 'invalidEmail';
    }
    
    // Validate phone
    if (!validateRequired(formData.phone)) {
        errors.phone = 'requiredField';
    } else if (!validatePhone(formData.phone)) {
        errors.phone = 'invalidPhone';
    }
    
    // Validate number of persons
    if (!validateNumberOfPersons(formData.numberOfPersons)) {
        errors.numberOfPersons = 'invalidNumberOfPersons';
    }
    
    // Validate date
    const dateValidation = validateDate(formData.date);
    if (!dateValidation.valid) {
        errors.date = dateValidation.reason;
    }
    
    // Validate time
    if (!validateRequired(formData.startTime)) {
        errors.startTime = 'requiredField';
    }
    
    // Validate meal category
    if (!validateRequired(formData.category)) {
        errors.category = 'requiredField';
    }
    
    // Return validation result
    return {
        valid: Object.keys(errors).length === 0,
        errors: errors
    };
}

// Display validation errors on the form
export function displayValidationErrors(validationResult) {
    // Clear previous error messages
    document.querySelectorAll('.validation-error').forEach(el => el.remove());
    
    // No errors to display
    if (validationResult.valid) {
        return;
    }
    
    // Display error messages for each invalid field
    for (const field in validationResult.errors) {
        const inputElement = document.getElementById(field);
        if (!inputElement) continue;
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'validation-error';
        errorMessage.textContent = translate(`validation.${validationResult.errors[field]}`);
        
        // Add error styling to input
        inputElement.classList.add('input-error');
        
        // Insert error message after the input
        inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
        
        // Add event listener to clear error when input changes
        inputElement.addEventListener('input', function() {
            this.classList.remove('input-error');
            const errorEl = this.parentNode.querySelector('.validation-error');
            if (errorEl) errorEl.remove();
        }, { once: true });
    }
    
    // Focus the first field with an error
    const firstErrorField = document.getElementById(Object.keys(validationResult.errors)[0]);
    if (firstErrorField) {
        firstErrorField.focus();
    }
}

// Make validation functions available globally
window.validateReservationForm = validateReservationForm;
window.displayValidationErrors = displayValidationErrors;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateRequired = validateRequired;
window.validateNumberOfPersons = validateNumberOfPersons;
window.validateDate = validateDate;