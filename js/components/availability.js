// Function to check availability via Cloud Function
export function checkAvailability(numberOfPersons, date, category, startTime) {
    // Calculate end time
    const endTime = calculateEndTime(startTime);
    
    // Get elements
    const availabilityAlert = document.getElementById('availabilityAlert');
    const availabilityStatus = document.getElementById('availabilityStatus');
    const submitButton = document.getElementById('submitButton');
    
    // Show checking status
    availabilityAlert.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        ${translate('alerts.checking')}
        <span class="alert-close">&times;</span>
    `;
    availabilityAlert.classList.add('show');
    
    // Set up alert close buttons
    availabilityAlert.querySelector('.alert-close').addEventListener('click', function() {
        availabilityAlert.classList.remove('show');
    });
    
    // Disable submit button during check
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner"></span> ${translate('form.checking')}`;
    
    // Call the Cloud Function
    const checkAvailabilityFn = functions.httpsCallable('checkAvailability');
    checkAvailabilityFn({
        numberOfPersons: numberOfPersons,
        date: date,
        category: category,
        startTime: startTime,
        endTime: endTime,
        isDebug: isDebugEnvironment() // Pass the environment flag
    }).then((result) => {
        // Hide checking alert
        availabilityAlert.classList.remove('show');
        
        const { 
            available, 
            capacityAvailable, 
            message, 
            availableTables, 
            tablesNeeded
        } = result.data;
        
        // Log check to admin panel
        if (window.logToAdmin && isDebugEnvironment()) {
            logToAdmin(`Availability check: ${date}, ${category}, ${startTime} - ${available ? 'Available' : 'Not available'}`);
        }
        
        // Update availability status with appropriate information
        displayAvailabilityStatus(available, numberOfPersons, availableTables || 0, [], tablesNeeded || 0, startTime);
        
        // Enable or disable submit button based on availability
        submitButton.disabled = !available;
        submitButton.innerHTML = available ? 
            translate('form.submit') : 
            translate('form.noTablesAvailable');
        
        // Apply animation if available
        if (available) {
            submitButton.style.animation = 'pulse 1s';
            setTimeout(() => {
                submitButton.style.animation = '';
            }, 1000);
        }
        
    }).catch((error) => {
        console.error('Error checking availability:', error);
        availabilityAlert.classList.remove('show');
        submitButton.disabled = false;
        submitButton.innerHTML = translate('form.submit');
        
        // Log error to admin panel
        if (window.logToAdmin) {
            logToAdmin(`Error checking availability: ${error.message}`);
        }
        
        // Show error alert
        showError(translate('alerts.availabilityError'));
    });
}

// Display availability status
export function displayAvailabilityStatus(available, numberOfPersons, availableTables, occupiedTables, tablesNeeded, startTime) {
    const availabilityStatus = document.getElementById('availabilityStatus');
    
    // Default values if undefined
    availableTables = availableTables || 0;
    tablesNeeded = tablesNeeded || 0;
    
    // Update availability status
    availabilityStatus.classList.add('show');
    availabilityStatus.className = 'availability-status ' + (available ? 'available' : 'unavailable') + ' show';
    
    if (available) {
        availabilityStatus.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                ${translate('availability.tablesAvailable', { count: availableTables })}
            </div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                ${translate('availability.comfortablySeated', { count: numberOfPersons })}
            </div>
        `;
    } else {
        // Get the current category (lunch or dinner)
        const category = document.getElementById('category').value;
        
        // Parse the current time
        const currentHour = parseInt(startTime.split(':')[0]);
        const currentMinute = parseInt(startTime.split(':')[1]);
        
        // Get available time slots based on category
        const timeSlots = getAvailableTimeSlots(category);
        
        // Find the current time slot index
        const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        const currentIndex = timeSlots.indexOf(currentTimeString);
        
        // Determine if earlier/later slots are available
        const hasEarlierSlot = currentIndex > 0;
        const hasLaterSlot = currentIndex < timeSlots.length - 1;
        
        // Get alternative time suggestions
        let alternativeMessage = `
            <div style="margin-top: 12px; font-size: 14px;">
                ${translate('availability.recommendTimes')}
                <ul style="margin-top: 4px; margin-bottom: 0; padding-left: 24px;">
        `;
        
        // Add earlier slot if available
        if (hasEarlierSlot) {
            const earlierTime = timeSlots[currentIndex - 1];
            alternativeMessage += `<li>${earlierTime} (${translate('availability.earlier')})</li>`;
        }
        
        // Add later slot if available
        if (hasLaterSlot) {
            const laterTime = timeSlots[currentIndex + 1];
            alternativeMessage += `<li>${laterTime} (${translate('availability.later')})</li>`;
        }
        
        // If no alternative slots are available, provide a different message
        if (!hasEarlierSlot && !hasLaterSlot) {
            alternativeMessage = `
                <div style="margin-top: 12px; font-size: 14px;">
                    ${translate('availability.noAlternativeTimes')}
                </div>
            `;
        } else {
            alternativeMessage += `
                </ul>
            </div>
            `;
        }
        
        // Show unavailability message without specific table information
        availabilityStatus.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
                ${translate('availability.notEnoughTables')}
            </div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                We need more tables for your party of ${numberOfPersons} at this time.
            </div>
            ${alternativeMessage}
        `;
    }
}

// Helper function to get available time slots based on category
function getAvailableTimeSlots(category) {
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
    
    return timeSlots;
}
