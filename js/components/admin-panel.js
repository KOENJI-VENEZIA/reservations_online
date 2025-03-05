// Import required functions
import { getTranslation } from '../utils/locale.js';
import { showConfirmationModal } from './modal.js';
import { googleSignIn, logout, addAdmin, removeAdmin, isAuthorizedAdmin, renderAdminList } from '../services/auth.js';

// Initialize admin panel
export function initializeAdminPanel() {
    // Load admin panel HTML
    loadAdminPanelHTML();
    
    // Add event listeners for admin panel toggle
    setupAdminPanelToggle();
}

// Load admin panel HTML content
function loadAdminPanelHTML() {
    const adminPanel = document.getElementById('adminPanel');
    
    adminPanel.innerHTML = `
        <div class="admin-panel-header">
            <h2>${getTranslation('admin.panelTitle')}</h2>
            <button class="admin-panel-close" id="adminPanelClose">&times;</button>
        </div>
        
        <!-- Login Section (shown when not logged in) -->
        <div id="adminLoginSection" class="login-section">
            <p style="margin-bottom: 20px; text-align: center;">${getTranslation('admin.signInPrompt')}</p>
            <button id="googleSignInButton" class="google-signin-button">
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo">
                ${getTranslation('admin.signInWithGoogle')}
            </button>
        </div>
        
        <!-- Admin Content (shown when logged in and authorized) -->
        <div id="adminContent" style="display: none;">
            <!-- User Info -->
            <div class="user-info">
                <img id="userAvatar" src="" alt="User avatar" class="user-avatar">
                <div>
                    <div id="userName" class="user-name"></div>
                    <div id="userEmail" class="user-email"></div>
                </div>
            </div>
            
            <!-- Environment Section -->
            <div class="admin-section">
                <h3>${getTranslation('admin.environmentSettings')} <span id="environmentIndicator" class="env-tag release">Release</span></h3>
                <div class="admin-row" style="margin-top: 15px;">
                    <label for="envToggle">${getTranslation('admin.environment')}:</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="envToggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span id="toggleLabel">Release</span>
                </div>
            </div>
            
            <!-- Admin Users Section -->
            <div class="admin-section">
                <h3>${getTranslation('admin.authorizedAdmins')}</h3>
                <p style="margin-bottom: 10px; font-size: 14px;">
                    ${getTranslation('admin.adminDescription')}
                </p>
                
                <div class="form-group">
                    <div class="admin-row">
                        <input type="email" id="newAdminEmail" placeholder="${getTranslation('admin.addNewAdmin')}">
                        <button id="addAdminButton" class="admin-action-button">${getTranslation('admin.add')}</button>
                    </div>
                </div>
                
                <div id="adminList" class="admin-list">
                    <!-- Admin users will be listed here -->
                </div>
            </div>
            
            <!-- Debug Info Section -->
            <div class="admin-section">
                <h3>${getTranslation('admin.debugInfo')}</h3>
                <div id="logsContainer" class="logs-container">
                    <!-- Debug logs will appear here -->
                </div>
                <button id="clearLogsButton" class="admin-action-button" style="margin-top: 10px;">${getTranslation('admin.clearLogs')}</button>
            </div>
            
            <!-- Sign Out Button -->
            <button id="signOutButton" class="admin-action-button secondary small">${getTranslation('admin.signOut')}</button>
        </div>
    `;
    
    // Initialize log functionality
    setupLogFunctionality();
    
    // Set up environment toggle
    setupEnvironmentToggle();
    
    // Set up admin user management
    setupAdminUserManagement();
}

// Set up admin panel toggle buttons
function setupAdminPanelToggle() {
    // Admin button to open panel
    document.getElementById('adminButton').addEventListener('click', function() {
        document.getElementById('adminPanel').classList.add('active');
    });
    
    // Close button inside panel
    document.addEventListener('click', function(event) {
        if (event.target.id === 'adminPanelClose') {
            document.getElementById('adminPanel').classList.remove('active');
        }
    });
}

// Log functionality
function setupLogFunctionality() {
    const logsContainer = document.getElementById('logsContainer');
    const clearLogsButton = document.getElementById('clearLogsButton');
    
    // Clear logs button functionality
    clearLogsButton.addEventListener('click', function() {
        showConfirmationModal(
            getTranslation('admin.confirmClearLogs'),
            () => {
                localStorage.setItem('adminLogs', '[]');
                logsContainer.innerHTML = '';
                window.logToAdmin(getTranslation('admin.logsCleared'));
            }
        );
    });
    
    // Load logs from localStorage
    loadLogs();
    
    // Set global log function
    window.logToAdmin = function(message) {
        const timestamp = new Date().toISOString().slice(11, 19);
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${timestamp}] ${message}`;
        logsContainer.prepend(logEntry);
        
        // Store in localStorage for persistence
        const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
        logs.unshift(`[${timestamp}] ${message}`);
        
        // Limit to last 100 logs
        if (logs.length > 100) logs.length = 100;
        
        localStorage.setItem('adminLogs', JSON.stringify(logs));
    };
}

// Load logs from localStorage
function loadLogs() {
    const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
    const logsContainer = document.getElementById('logsContainer');
    
    logsContainer.innerHTML = '';
    logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logsContainer.appendChild(logEntry);
    });
}

// Environment toggle setup
function setupEnvironmentToggle() {
    const envToggle = document.getElementById('envToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const environmentIndicator = document.getElementById('environmentIndicator');
    
    // Initialize environment settings from localStorage
    const isDebugMode = localStorage.getItem('isDebugMode') === 'true';
    envToggle.checked = isDebugMode;
    updateEnvironmentUI(isDebugMode);
    
    // Environment toggle functionality
    envToggle.addEventListener('change', function() {
        const isDebug = this.checked;
        localStorage.setItem('isDebugMode', isDebug);
        updateEnvironmentUI(isDebug);
        window.logToAdmin(`${getTranslation('admin.environmentChanged')}: ${isDebug ? getTranslation('admin.debug') : getTranslation('admin.release')}`);
    });
}

// Helper to update UI based on environment
function updateEnvironmentUI(isDebug) {
    const toggleLabel = document.getElementById('toggleLabel');
    const environmentIndicator = document.getElementById('environmentIndicator');
    
    toggleLabel.textContent = isDebug ? getTranslation('admin.debug') : getTranslation('admin.release');
    environmentIndicator.textContent = isDebug ? getTranslation('admin.debug') : getTranslation('admin.release');
    environmentIndicator.className = `env-tag ${isDebug ? 'debug' : 'release'}`;
}

// Admin user management
function setupAdminUserManagement() {
    // Google sign in button
    document.getElementById('googleSignInButton').addEventListener('click', function() {
        googleSignIn();
    });
    
    // Sign out button
    document.getElementById('signOutButton').addEventListener('click', function() {
        logout();
    });
    
    // Add admin button
    document.getElementById('addAdminButton').addEventListener('click', function() {
        const email = document.getElementById('newAdminEmail').value.trim();
        addAdmin(email);
    });
    
    // Render admin list initially
    renderAdminList();
}

// Export additional functions that might be needed elsewhere
export {
    loadAdminPanelHTML,
    setupAdminPanelToggle,
    setupLogFunctionality,
    loadLogs,
    setupEnvironmentToggle,
    updateEnvironmentUI,
    setupAdminUserManagement
};