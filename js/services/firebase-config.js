// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBflMPHQnuye_Vj7h1Wwks65cVDkSo2JKQ",
    authDomain: "koenji-app.firebaseapp.com",
    projectId: "koenji-app",
    storageBucket: "koenji-app.firebasestorage.app",
    messagingSenderId: "307119229497",
    appId: "1:307119229497:ios:06d2841c6f20863c921be8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const db = firebase.firestore();
const functions = firebase.functions();
const auth = firebase.auth();

// Helper function to get current environment (debug/release)
function isDebugEnvironment() {
    return localStorage.getItem('isDebugMode') === 'true';
}

// Helper function to get the correct collection name based on environment
function getCollectionName() {
    return isDebugEnvironment() ? "reservations" : "reservations_release";
}

// Log collection name for debugging
console.log(`Using collection: ${getCollectionName()}`);


// Generate a UUID for the reservation
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Log error to admin panel (if available)
function logToAdmin(message) {
    if (typeof window.logToAdmin === 'function') {
        window.logToAdmin(message);
    } else {
        console.log('[Admin Log]', message);
    }
}