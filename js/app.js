// app.js

import { db, getCollectionName, isDebugEnvironment } from '../js/services/firebase-config';
import { initializeLocalization } from '../js/utils/locale';
import { initializeTheme } from '../js/services/theme';
import { initializeAdminPanel } from '../js/components/admin-panel';
import { initializeFormHandlers } from '../js/components/form';
import { initializeModal } from '../js/components/modal';

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
  try {
    verifyFirebaseConfiguration();
    initializeLocalization();
    initializeTheme();
    initializeAdminPanel();
    initializeFormHandlers();
    initializeDateTimeConstraints();
    setupAlerts();
    initializeModal();

    console.log('Restaurant reservation application initialized');
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
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} catch (error)
{
    console.log(error.message)
}
