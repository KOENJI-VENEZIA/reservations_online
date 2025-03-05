
import { getTranslation } from '../utils/locale.js';
import { logToAdmin } from './firebase-config.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirebase } from './firebase-config.js';

const app = initializeFirebase();

// Initialize Firebase properly:
// FIXED: Removed redundant auth variable declaration
// Using firebase.auth() directly instead of getAuth(app)
// This matches how auth is used elsewhere in your codebase

// Initialize authentication
let currentUser = null;

// Global authorizedAdmins array
window.authorizedAdmins = window.authorizedAdmins || ['matteo.koenji@gmail.com'];

// Initialize auth
export function initializeAuth() {
    // Set up auth state listener
    setupAuthListeners();
    
    // Load authorized admins from localStorage
    loadAuthorizedAdmins();
    
    // Set up admin panel UI
    const loginButton = document.getElementById('adminLoginButton');
    const logoutButton = document.getElementById('adminLogoutButton');
    const addAdminForm = document.getElementById('addAdminForm');
    
    if (loginButton) {
        loginButton.addEventListener('click', googleSignIn);
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newAdminEmail');
            if (emailInput && emailInput.value) {
                addAdmin(emailInput.value);
                emailInput.value = '';
            }
        });
    }
    
    // Make auth functions available globally
    window.isAuthorizedAdmin = isAuthorizedAdmin;
    window.addAdmin = addAdmin;
    window.removeAdmin = removeAdmin;
    window.logout = logout;
    window.getCurrentUser = getCurrentUser;
}

// Load authorized admins from localStorage
function loadAuthorizedAdmins() {
    try {
        const storedAdmins = localStorage.getItem('authorizedAdmins');
        if (storedAdmins) {
            window.authorizedAdmins = JSON.parse(storedAdmins);
        } else {
            // Initialize with default admin
            localStorage.setItem('authorizedAdmins', JSON.stringify(window.authorizedAdmins));
        }
    } catch (error) {
        console.error('Error loading authorized admins:', error);
        // Keep default admins
    }
}

// Setup authentication state change listener
function setupAuthListeners() {
    if (!firebase.auth) return; // Skip if auth is not initialized
    
    onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            console.log('User signed in:', user.email);
            
            // Check if user is authorized
            if (isAuthorizedAdmin(user.email)) {
                // Update UI for authorized user
                const adminLoginSection = document.getElementById('adminLoginSection');
                const adminContent = document.getElementById('adminContent');
                
                if (adminLoginSection) adminLoginSection.style.display = 'none';
                if (adminContent) adminContent.style.display = 'block';
                
                // Set user info
                const userAvatar = document.getElementById('userAvatar');
                const userName = document.getElementById('userName');
                const userEmail = document.getElementById('userEmail');
                
                if (userAvatar) userAvatar.src = user.photoURL || 'https://via.placeholder.com/40';
                if (userName) userName.textContent = user.displayName || 'Admin User';
                if (userEmail) userEmail.textContent = user.email;
                
                console.log('Admin access granted');
                
                // Render admin list
                renderAdminList();
            } else {
                // Not authorized
                if (typeof alert === 'function') {
                    alert(getTranslation ? getTranslation('admin.noAccess') : 'No access');
                }
                logout();
            }
        } else {
            // User is signed out
            console.log('User signed out');
            const adminLoginSection = document.getElementById('adminLoginSection');
            const adminContent = document.getElementById('adminContent');
            
            if (adminLoginSection) adminLoginSection.style.display = 'flex';
            if (adminContent) adminContent.style.display = 'none';
        }
    });
}

// Google Sign In
export function googleSignIn() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(error => {
        console.error('Error signing in with Google:', error);
        if (typeof logToAdmin === 'function') {
            logToAdmin(`Sign-in error: ${error.message}`);
        }
    });
}

export function logout() {
    signOut(auth).then(() => {
        // your sign out UI update logic here
    }).catch(error => {
        console.error('Error signing out:', error);
        if (typeof logToAdmin === 'function') {
            logToAdmin(`Sign-out error: ${error.message}`);
        }
    });
}


// Check if user is authorized admin
export function isAuthorizedAdmin(email) {
    return window.authorizedAdmins.includes(email);
}

// Add new admin
export function addAdmin(email) {
    if (!email) {
        if (typeof alert === 'function') {
            alert(getTranslation ? getTranslation('admin.enterEmail') : 'Please enter an email');
        }
        return;
    }
    
    if (!isValidEmail(email)) {
        if (typeof alert === 'function') {
            alert(getTranslation ? getTranslation('admin.invalidEmail') : 'Invalid email format');
        }
        return;
    }
    
    if (isAuthorizedAdmin(email)) {
        if (typeof alert === 'function') {
            alert(getTranslation ? getTranslation('admin.alreadyAdmin') : 'This email is already an admin');
        }
        return;
    }
    
    // Add to authorized admins
    window.authorizedAdmins.push(email);
    localStorage.setItem('authorizedAdmins', JSON.stringify(window.authorizedAdmins));
    
    // Update UI
    renderAdminList();
    
    console.log(`Added admin access for ${email}`);
}

// Remove admin
export function removeAdmin(email) {
    if (!email) return;
    
    const index = window.authorizedAdmins.indexOf(email);
    if (index !== -1) {
        // Remove from array
        window.authorizedAdmins.splice(index, 1);
        localStorage.setItem('authorizedAdmins', JSON.stringify(window.authorizedAdmins));
        
        // Update UI
        renderAdminList();
        
        // If current user is removed as admin, sign them out
        if (currentUser && currentUser.email === email) {
            logout();
        }
        
        console.log(`Removed admin access for ${email}`);
    }
}

// Render admin list
export function renderAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    adminList.innerHTML = '';
    window.authorizedAdmins.forEach(email => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        
        const emailSpan = document.createElement('span');
        emailSpan.className = 'admin-list-item-email';
        emailSpan.textContent = email;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'admin-list-item-remove';
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', () => removeAdmin(email));
        
        item.appendChild(emailSpan);
        item.appendChild(removeButton);
        adminList.appendChild(item);
    });
}

// Email validation helper
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Set up window.jest flag if in test environment
if (typeof jest !== 'undefined') {
    if (typeof window === 'undefined') {
        global.window = {};
    }
    window.jest = true;
}

// Initialize auth when this script loads (but not in test environment)
if (typeof window !== 'undefined' && !window.jest) {
    initializeAuth();
}
