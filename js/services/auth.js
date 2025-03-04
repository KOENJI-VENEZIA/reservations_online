// Initialize authentication
let auth;
let currentUser = null;
let authorizedAdmins = ['matteo.koenji@gmail.com']; // Default admin

// Initialize authentication
function initializeAuth() {
    // Set up Firebase auth reference
    auth = firebase.auth();
    
    // Load authorized admins from localStorage
    loadAuthorizedAdmins();
    
    // Set up auth state listeners
    setupAuthListeners();
    
    // Make auth functions available globally
    window.isAuthorizedAdmin = isAuthorizedAdmin;
    window.addAdmin = addAdmin;
    window.removeAdmin = removeAdmin;
    window.signOut = signOut;
    window.getCurrentUser = getCurrentUser;
}

// Load authorized admins from localStorage
function loadAuthorizedAdmins() {
    const savedAdmins = localStorage.getItem('authorizedAdmins');
    if (savedAdmins) {
        try {
            const parsedAdmins = JSON.parse(savedAdmins);
            if (Array.isArray(parsedAdmins) && parsedAdmins.length > 0) {
                authorizedAdmins = parsedAdmins;
            }
        } catch (e) {
            console.error('Error parsing authorized admins:', e);
        }
    }
}

// Setup authentication state change listener
function setupAuthListeners() {
    if (!auth) return; // Skip if auth is not initialized
    
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            currentUser = user;
            console.log('User signed in:', user.email);
            
            // Check if user is authorized
            if (isAuthorizedAdmin(user.email)) {
                // Update UI for authorized user
                document.getElementById('adminLoginSection').style.display = 'none';
                document.getElementById('adminContent').style.display = 'block';
                
                // Set user info
                document.getElementById('userAvatar').src = user.photoURL || 'https://via.placeholder.com/40';
                document.getElementById('userName').textContent = user.displayName || 'Admin User';
                document.getElementById('userEmail').textContent = user.email;
                
                console.log('Admin access granted');
                
                // Render admin list
                renderAdminList();
            } else {
                // Not authorized
                alert(translate('admin.noAccess'));
                signOut();
            }
        } else {
            // User is signed out
            console.log('User signed out');
            document.getElementById('adminLoginSection').style.display = 'flex';
            document.getElementById('adminContent').style.display = 'none';
        }
    });
}

// Google Sign In
function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => {
        console.error('Error signing in with Google:', error);
        logToAdmin(`Sign-in error: ${error.message}`);
    });
}

// Sign Out
function signOut() {
    auth.signOut().then(() => {
        document.getElementById('adminLoginSection').style.display = 'flex';
        document.getElementById('adminContent').style.display = 'none';
        currentUser = null;
        console.log('User signed out');
    }).catch(error => {
        console.error('Error signing out:', error);
        logToAdmin(`Sign-out error: ${error.message}`);
    });
}

// Check if user is authorized admin
function isAuthorizedAdmin(email) {
    return authorizedAdmins.includes(email);
}

// Add new admin
function addAdmin(email) {
    if (!email) {
        alert(translate('admin.enterEmail'));
        return;
    }
    
    if (!isValidEmail(email)) {
        alert(translate('admin.invalidEmail'));
        return;
    }
    
    if (authorizedAdmins.includes(email)) {
        alert(translate('admin.alreadyAdmin'));
        return;
    }
    
    showConfirmationModal(
        translate('admin.confirmAdd', { email }),
        () => {
            authorizedAdmins.push(email);
            localStorage.setItem('authorizedAdmins', JSON.stringify(authorizedAdmins));
            renderAdminList();
            document.getElementById('newAdminEmail').value = '';
            console.log(`Added ${email} as admin`);
        }
    );
}

// Remove admin
function removeAdmin(email) {
    if (email === 'matteo.koenji@gmail.com') {
        alert(translate('admin.cannotRemoveDefault'));
        return;
    }
    
    showConfirmationModal(
        translate('admin.confirmRemove', { email }),
        () => {
            const index = authorizedAdmins.indexOf(email);
            if (index !== -1) {
                authorizedAdmins.splice(index, 1);
                localStorage.setItem('authorizedAdmins', JSON.stringify(authorizedAdmins));
                renderAdminList();
                console.log(`Removed admin access for ${email}`);
                
                // If current user is removed as admin, sign them out
                if (currentUser && currentUser.email === email) {
                    signOut();
                }
            }
        }
    );
}

// Render admin list
function renderAdminList() {
    const adminList = document.getElementById('adminList');
    if (!adminList) return;
    
    adminList.innerHTML = '';
    authorizedAdmins.forEach(email => {
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
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Initialize auth when this script loads
initializeAuth();
