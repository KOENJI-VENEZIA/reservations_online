// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyBflMPHQnuye_Vj7h1Wwks65cVDkSo2JKQ",
    authDomain: "koenji-app.firebaseapp.com",
    projectId: "koenji-app",
    storageBucket: "koenji-app.firebasestorage.app",
    messagingSenderId: "307119229497",
    appId: "1:307119229497:ios:06d2841c6f20863c921be8"
};

export function initializeFirebase() {
    const app = initializeApp(firebaseConfig);
    return {
        app,
        db: getFirestore(app),
        functions: getFunctions(app),
        auth: getAuth(app)
    };
}

const firebaseInstance = initializeFirebase();
export default firebaseInstance; 