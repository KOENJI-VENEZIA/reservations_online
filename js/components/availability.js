// Function to check availability via Cloud Function
function checkAvailability(numberOfPersons, date, category, startTime) {
    // Calculate end time
    const endTime = calculateEndTime(startTime);
    
    // Get elements
    const availabilityAlert = document.getElementById('availabilityAlert');
    const availabilityStatus = document.getElementById('availabilityStatus');
    const submitButton = document.getElementById('submitButton');
    
    // Show checking status
    availabilityAlert.style.display = 'block';
    availabilityAlert.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        ${translate('alerts.checking')}
        <span class="alert-close">&times;</span>
    `;
    
    // Set up alert close buttons
    availabilityAlert.querySelector('.alert-close').addEventListener('click', function() {
        availabilityAlert.style.display = 'none';
    });
    
    // Disable submit button during check
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner"></span> ${translate('form.checking')}`;
    
    // Call the Cloud Function
    const checkAvailabilityFn = functions.httpsCallable('checkAvailability');
    checkAvailabilityFn({
        numberOfPersons,
        date,
        category,
        startTime,
        endTime,
        isDebug: isDebugEnvironment() // Pass the environment flag
    }).then((result) => {
        // Hide checking alert
        availabilityAlert.style.display = 'none';
        
        const { 
            available, 
            capacityAvailable, 
            message, 
            availableTables, 
            occupiedTables,
            tablesNeeded
        } = result.data;
        
        // Log check to admin panel
        if (isDebugEnvironment()) {
            logToAdmin(`Availability check: ${date}, ${category}, ${startTime} - ${available ? 'Available' : 'Not available'}`);
        }
        
        // Update availability status with appropriate information
        displayAvailabilityStatus(available, numberOfPersons, availableTables, occupiedTables, tablesNeeded, startTime);
        
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
        availabilityAlert.style.display = 'none';
        submitButton.disabled = false;
        submitButton.innerHTML = translate('form.submit');
        
        // Log error to admin panel
        logToAdmin(`Error checking availability: ${error.message}`);
        
        // Show error alert
        showError(translate('alerts.availabilityError'));
    });
}

// Display availability status
function displayAvailabilityStatus(available, numberOfPersons, availableTables, occupiedTables, tablesNeeded, startTime) {
    const availabilityStatus = document.getElementById('availabilityStatus');
    
    // Update availability status
    availabilityStatus.style.display = 'block';
    availabilityStatus.className = 'availability-status ' + (available ? 'available' : 'unavailable');
    
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
        // Create alternative time suggestions
        const currentHour = parseInt(startTime.split(':')[0]);
        const currentMinute = parseInt(startTime.split(':')[1]);
        
        // Suggest checking 30 minutes before or after
        const earlierHour = currentMinute >= 30 ? currentHour : (currentHour - 1);
        const earlierMinute = currentMinute >= 30 ? (currentMinute - 30) : (currentMinute + 30);
        
        const laterHour = currentMinute < 30 ? currentHour : (currentHour + 1);
        const laterMinute = currentMinute < 30 ? (currentMinute + 30) : (currentMinute - 30);
        
        const earlierTime = `${String(earlierHour).padStart(2, '0')}:${String(earlierMinute).padStart(2, '0')}`;
        const laterTime = `${String(laterHour).padStart(2, '0')}:${String(laterMinute).padStart(2, '0')}`;
        
        const alternativeMessage = `
            <div style="margin-top: 12px; font-size: 14px;">
                ${translate('availability.recommendTimes')}
                <ul style="margin-top: 4px; margin-bottom: 0; padding-left: 24px;">
                    <li>${earlierTime} (${translate('availability.earlier')})</li>
                    <li>${laterTime} (${translate('availability.later')})</li>
                </ul>
            </div>
        `;
        
        // Show occupied tables info
        availabilityStatus.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
                ${translate('availability.notEnoughTables')}
            </div>
            <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                ${translate('availability.tablesNeeded', { 
                    tablesNeeded: tablesNeeded,
                    numberOfPersons: numberOfPersons,
                    occupiedTables: occupiedTables
                })}
            </div>
            ${alternativeMessage}
        `;
    }
}
