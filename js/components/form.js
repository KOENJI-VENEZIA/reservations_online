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
    
    // Define time ranges based on category
    let startHour, endHour;
    if (category === 'lunch') {
        startHour = 12;
        endHour = 13.75; // Last slot at 13:45
    } else { // dinner
        startHour = 18;
        endHour = 21.75; // Last slot at 21:45
    }
    
    // Add time slots in 15-minute increments
    for (let h = startHour; h <= endHour; h += 0.25) {
        const hour = Math.floor(h);
        const minute = (h - hour) * 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = timeString;
        startTimeSelect.appendChild(option);
    }
    
    // Update end time display
    updateEndTimeDisplay(startTimeSelect.value);
    
    // Check availability after time slots are updated (if form fields are valid)
    checkAvailabilityIfFormValid();
}

// Update end time display
function updateEndTimeDisplay(startTime) {
    const endTimeValue = document.getElementById('endTimeValue');
    
    if (!startTime) {
        endTimeValue.textContent = "--:--";
        return;
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 1;
    let endMinute = startMinute + 45;
    
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
function calculateEndTime(startTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 1;
    let endMinute = startMinute + 45;
    
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
        numberOfPersons: document.getElementById('numberOfPersons').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        startTime: document.getElementById('startTime').value,
        notes: document.getElementById('notes').value
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
    
    // Compute endTime (1h45m after startTime)
    const endTime = calculateEndTime(formData.startTime);
    
    // Generate a UUID for the reservation
    const reservationId = generateUUID();
    
    // Unix timestamp
    const nowSeconds = Date.now() / 1000;
    
    // Final availability check before submission
    const checkAvailabilityFn = functions.httpsCallable('checkAvailability');
    checkAvailabilityFn({
        numberOfPersons,
        date: dateString,
        category,
        startTime,
        endTime,
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
            name: name,
            phone: phone,
            email: email,
            numberOfPersons: numberOfPersons,
            dateString: dateString,
            category: category,
            startTime: startTime,
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
            source: "web"
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