// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Verify Firebase configuration
    verifyFirebaseConfiguration();
    
    // Initialize localization
    initializeLocalization();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize admin panel
    initializeAdminPanel();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize date and time constraints
    initializeDateTimeConstraints();
    
    // Set up alerts
    setupAlerts();
    
    // Initialize modal
    initializeModal();
    
    // Log application start
    console.log('Restaurant reservation application initialized');
});

// Verify Firebase configuration
function verifyFirebaseConfiguration() {
    try {
        // Try to access Firestore to verify Firebase is properly configured
        const testCollection = db.collection(getCollectionName());
        
        console.log(`Firebase initialized successfully. Using collection: ${getCollectionName()}`);
        
        // Check if debug mode is enabled
        if (isDebugEnvironment()) {
            console.log('Running in DEBUG mode - using collection "reservations"');
        } else {
            console.log('Running in RELEASE mode - using collection "reservations_release"');
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // Show an error message to the user
        const errorAlert = document.getElementById('errorAlert');
        errorAlert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            Firebase configuration error. Please check console for details.
            <span class="alert-close">&times;</span>
        `;
        errorAlert.style.display = 'block';
    }
}

// Setup alert close buttons
function setupAlerts() {
    document.querySelectorAll('.alert-close').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
}

// Initialize date and time constraints
function initializeDateTimeConstraints() {
    const today = new Date();
    const dateInput = document.getElementById('date');
    
    // Set min date to today
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
}
