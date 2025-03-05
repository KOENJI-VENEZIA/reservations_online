// Initialize form handlers
function initializeFormHandlers() {
    // Get form elements
    const form = document.getElementById('reservationForm');
    const numberOfPersonsInput = document.getElementById('numberOfPersons');
    const categorySelect = document.getElementById('category');
    const startTimeSelect = document.getElementById('startTime');
    const dateInput = document.getElementById('date');
    const endTimeValue = document.getElementById('endTimeValue');
    
    // Populate initial time slots
    updateTimeSlots();
    
    // Add event listeners
    categorySelect.addEventListener('change', updateTimeSlots);
    startTimeSelect.addEventListener('change', function() {
        updateEndTimeDisplay(this.value);
        checkAvailabilityIfFormValid();
    });
    
    dateInput.addEventListener('change', function(e) {
        const selectedDate = new Date(e.target.value);
        if (selectedDate.getDay() === 1) { // Monday
            // Show custom styled alert
            showError(translate('alerts.closedMonday'));
            e.target.value = new Date().toISOString().split('T')[0]; // Reset to today
        } else {
            checkAvailabilityIfFormValid();
        }
    });
    
    // Check availability when form fields change
    [numberOfPersonsInput, dateInput, categorySelect, startTimeSelect].forEach(element => {
        element.addEventListener('change', function() {
            checkAvailabilityIfFormValid();
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
}

// Update time slots based on meal category
function updateTimeSlots() {
    const category = document.getElementById('category').value;
    const startTimeSelect = document.getElementById('startTime');
    
    // Clear existing options
    startTimeSelect.innerHTML = '';
    
    // Define specific time slots based on category
    let timeSlots = [];
    
    if (category === 'lunch') {
        // Only 12:00 and 13:30 for lunch
        timeSlots = ['12:00', '13:30'];
    } else { // dinner
        // From 18:00 to 19:30 and from 21:00 to 21:45 for dinner
        // First range: 18:00 to 19:30 in 15-minute increments
        for (let h = 18; h <= 19.5; h += 0.25) {
            const hour = Math.floor(h);
            const minute = (h - hour) * 60;
            timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
        
        // Second range: 21:00 to 21:45 in 15-minute increments
        for (let h = 21; h <= 21.75; h += 0.25) {
            const hour = Math.floor(h);
            const minute = (h - hour) * 60;
            timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
    }
    
    // Add time slots to select element
    timeSlots.forEach(timeString => {
        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = timeString;
        startTimeSelect.appendChild(option);
    });
    
    // Update end time display
    updateEndTimeDisplay(startTimeSelect.value);
    
    // Check availability after time slots are updated (if form fields are valid)
    checkAvailabilityIfFormValid();
}

// Update end time display dynamically based on category
function updateEndTimeDisplay(startTime) {
    const category = document.getElementById('category').value;
    const endTimeValue = document.getElementById('endTimeValue');
    
    if (!startTime) {
        endTimeValue.textContent = "--:--";
        return;
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 1;
    let endMinute = category === 'lunch' ? startMinute + 20 : startMinute + 45;
    
    if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    endTimeValue.textContent = endTime;
}

// Check availability if all required fields are filled
function checkAvailabilityIfFormValid() {
    const numberOfPersons = parseInt(document.getElementById('numberOfPersons').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const startTime = document.getElementById('startTime').value;
    
    if (numberOfPersons && date && category && startTime) {
        checkAvailability(numberOfPersons, date, category, startTime);
    }
}

// Calculate end time from start time
function calculateEndTime(startTime, category) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 1;
    let endMinute = category === 'lunch' ? startMinute + 20 : startMinute + 45;
    
    if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
    }
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Hide previous alerts
    document.getElementById('successAlert').style.display = 'none';
    document.getElementById('errorAlert').style.display = 'none';
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        numberOfPersons: parseInt(document.getElementById('numberOfPersons').value),
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        startTime: document.getElementById('startTime').value,
        notes: document.getElementById('notes').value || "",
        preferredLanguage: document.getElementById('preferredLanguage').value,
    };
    
    // Validate form data
    const validationResult = validateReservationForm(formData);
    
    // If validation fails, display errors and return
    if (!validationResult.valid) {
        displayValidationErrors(validationResult);
        return;
    }
    
    // Get submit button
    const submitButton = document.getElementById('submitButton');
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner"></span> ${translate('form.submitting')}`;
    
    // Append "[web reservation]; Email: ..." if you like
    const notes = `${formData.notes}; [web reservation]; Email: ${formData.email}`;
    
    // Compute endTime (dynamically 1h45m or 1h20m after startTime)
    const endTime = calculateEndTime(formData.startTime, formData.category);
    
    // Generate a UUID for the reservation
    const reservationId = generateUUID();
    
    // Unix timestamp
    const nowSeconds = Date.now() / 1000;
    
    // Final availability check before submission
    const checkAvailability = functions.httpsCallable('checkAvailability');
    checkAvailability({
        numberOfPersons: formData.numberOfPersons,
        date: formData.date,
        category: formData.category,
        startTime: formData.startTime,
        endTime: endTime,
        isDebug: isDebugEnvironment()
    }).then((result) => {
        const { available } = result.data;
        
        if (!available) {
            // Show error if tables are no longer available
            showError(translate('alerts.noLongerAvailable'));
            
            // Reset button state
            resetSubmitButton();
            return;
        }
        
        // Create reservation doc
        const reservation = {
            id: reservationId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            numberOfPersons: formData.numberOfPersons,
            dateString: formData.date,
            category: formData.category,
            startTime: formData.startTime,
            endTime: endTime,
            acceptance: "toConfirm",
            status: "pending",
            reservationType: "inAdvance",
            group: false,
            notes: notes,
            tables: [],
            creationDate: nowSeconds,
            lastEditedOn: nowSeconds,
            isMock: false,
            assignedEmoji: "",
            source: "web",
            preferredLanguage: formData.preferredLanguage,
        };
        
        // Log collection and reservation data
        console.log(`Saving reservation to collection: ${getCollectionName()}`);
        console.log('Reservation data:', reservation);
        
        // Write doc to Firestore
        db.collection(getCollectionName()).doc(reservationId)
            .set(reservation)
            .then(() => {
                // Log success
                console.log("Reservation saved with ID:", reservationId);
                
                // Show success alert
                showSuccess(translate('alerts.success'));
                
                // Reset the form
                document.getElementById('reservationForm').reset();
                document.getElementById('date').value = new Date().toISOString().split('T')[0];
                updateTimeSlots();
                
                // Reset button state
                resetSubmitButton();
                
                // Clear availability status
                document.getElementById('availabilityStatus').style.display = 'none';
            })
            .catch((error) => {
                console.error("Error adding reservation:", error);
                
                // Show error alert
                showError(translate('alerts.error'));
                
                // Reset button state
                resetSubmitButton();
            });
        
    }).catch((error) => {
        console.error('Error during final availability check:', error);
        
        // Show error alert
        showError(translate('alerts.processingError'));
        
        // Reset button state
        resetSubmitButton();
    });
}

// Reset submit button state
function resetSubmitButton() {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.innerHTML = translate('form.submit');
}

// Show success alert
function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    successAlert.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        ${message}
        <span class="alert-close">&times;</span>
    `;
    successAlert.style.display = 'block';
    
    // Set up alert close button again
    successAlert.querySelector('.alert-close').addEventListener('click', function() {
        successAlert.style.display = 'none';
    });
    
    // Smoothly scroll to success message
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show error alert
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        ${message}
        <span class="alert-close">&times;</span>
    `;
    errorAlert.style.display = 'block';
    
    // Set up alert close button again
    errorAlert.querySelector('.alert-close').addEventListener('click', function() {
        errorAlert.style.display = 'none';
    });
}
