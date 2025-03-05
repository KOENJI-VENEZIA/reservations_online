// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';

export const firebaseConfig = {
  // your config here
};

export const initializeFirebase = () => {
  return initializeApp(firebaseConfig);
};

export const { db, functions, auth } = initializeFirebase();

// Helper function to get current environment (debug/release)
export function isDebugEnvironment() {
    return localStorage.getItem('isDebugMode') === 'true';
}

// Helper function to get the correct collection name based on environment
export function getCollectionName() {
    return isDebugEnvironment() ? "reservations" : "reservations_release";
}

// Log collection name for debugging
console.log(`Using collection: ${getCollectionName()}`);

// Generate a UUID for the reservation
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Log error to admin panel (if available)
export function logToAdmin(message) {
    if (typeof window.logToAdmin === 'function') {
        window.logToAdmin(message);
    } else {
        console.log('[Admin Log]', message);
    }
}