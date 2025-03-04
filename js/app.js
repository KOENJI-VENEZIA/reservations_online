// app.js
console.log('app.js loaded');

import { db, getCollectionName, isDebugEnvironment } from './services/firebase-config.js';
import { initializeLocalization } from './utils/locale.js';
import { initializeTheme } from './services/theme.js';
import { initializeAdminPanel } from './components/admin-panel.js';
import { initializeFormHandlers } from './components/form.js';
import { initializeModal } from './components/modal.js';

console.log('All modules imported successfully');

// ---------- EXPORT THE FUNCTIONS -----------
export function verifyFirebaseConfiguration() {
  try {
    const testCollection = db.collection(getCollectionName());
    console.log(`Firebase initialized successfully. Using collection: ${getCollectionName()}`);

    if (isDebugEnvironment()) {
      console.log('Running in DEBUG mode - using collection "reservations"');
    } else {
      console.log('Running in RELEASE mode - using collection "reservations_release"');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
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
}

export function setupAlerts() {
  document.querySelectorAll('.alert-close').forEach(button => {
    button.addEventListener('click', function() {
      this.parentElement.style.display = 'none';
    });
  });
}

export function initializeDateTimeConstraints() {
  const today = new Date();
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
  }
}

// Then your DOMContentLoaded logic can be exported or can remain inline:
function onDOMContentLoaded() {
  console.log('DOMContentLoaded event fired');
  try {
    console.log('Initializing application...');
    
    // Initialize Firebase
    verifyFirebaseConfiguration();
    console.log('Firebase configuration verified');
    
    // Initialize localization (language support)
    initializeLocalization();
    console.log('Localization initialized');
    
    // Initialize theme based on system preference
    initializeTheme();
    console.log('Theme initialized');
    
    // Initialize admin panel
    initializeAdminPanel();
    console.log('Admin panel initialized');
    
    // Initialize form handlers (including time slots)
    initializeFormHandlers();
    console.log('Form handlers initialized');
    
    // Initialize date/time constraints
    initializeDateTimeConstraints();
    console.log('Date/time constraints initialized');
    
    // Setup alert close buttons
    setupAlerts();
    console.log('Alerts set up');
    
    // Initialize modal functionality
    initializeModal();
    console.log('Modal initialized');

    console.log('Restaurant reservation application initialized successfully');
  } catch (error) {
    console.error('Error during application initialization:', error);
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
      errorAlert.innerHTML = `
        <div class="alert-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        Initialization error: ${error.message}
        <span class="alert-close">&times;</span>
      `;
      errorAlert.style.display = 'block';
    }
  }
}

try {
  console.log('Setting up DOMContentLoaded event listener');
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
  
  // Also add a fallback in case the DOMContentLoaded event has already fired
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, calling onDOMContentLoaded directly');
    setTimeout(onDOMContentLoaded, 1);
  }
} catch (error) {
  console.error('Error setting up DOMContentLoaded listener:', error);
}
