// Firebase configuration and initialization
// Use regular import for Jest compatibility
import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
    apiKey: "AIzaSyBflMPHQnuye_Vj7h1Wwks65cVDkSo2JKQ",
    authDomain: "koenji-app.firebaseapp.com",
    projectId: "koenji-app",
    storageBucket: "koenji-app.firebasestorage.app",
    messagingSenderId: "307119229497",
    appId: "1:307119229497:ios:06d2841c6f20863c921be8"
};


export const initializeFirebase = () => {
  return initializeApp(firebaseConfig);
};

// For testing purposes, create mock objects
export const db = { collection: () => ({}) };
export const functions = { httpsCallable: () => ({}) };
export const auth = { onAuthStateChanged: () => ({}) };

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