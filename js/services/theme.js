// Helper function to check if dark mode is preferred
function prefersDarkMode() {
    try {
        // First check if window.matchMedia exists
        if (!window.matchMedia) {
            return false;
        }
        
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return darkModeQuery && darkModeQuery.matches;
    } catch (error) {
        console.error('Error checking dark mode preference:', error);
        return false;
    }
}

// Helper function to handle theme change event
function handleThemeChange(e) {
    if (e.matches) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}

// Helper function to add theme change listener
function addThemeChangeListener() {
    try {
        if (window.matchMedia) {
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            
            if (prefersDarkScheme && typeof prefersDarkScheme.addEventListener === 'function') {
                // Listen for changes to system theme
                prefersDarkScheme.addEventListener('change', handleThemeChange);
                
                return true;
            } else if (prefersDarkScheme && typeof prefersDarkScheme.addListener === 'function') {
                // Fallback for older browsers
                prefersDarkScheme.addListener(handleThemeChange);
                
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error adding theme change listener:', error);
        return false;
    }
}

function initializeTheme() {
    // Check if system prefers dark mode
    const isDarkMode = module.exports.prefersDarkMode();
    console.log('System prefers dark mode:', isDarkMode);
    
    if (isDarkMode) {
        module.exports.applyDarkTheme();
    } else {
        module.exports.applyLightTheme();
    }
    
    // Add system theme change listener
    const listenerAdded = addThemeChangeListener();
    console.log('Theme change listener added:', listenerAdded);
}

// Apply dark theme
function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    if (themeStylesheet) {
        themeStylesheet.href = 'css/themes/dark.css';
    }
    
    console.log('Applied dark theme based on system preference');
}

// Apply light theme
function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    if (themeStylesheet) {
        themeStylesheet.href = 'css/themes/light.css';
    }
    
    console.log('Applied light theme based on system preference');
}

module.exports = {
    initializeTheme,
    applyDarkTheme,
    applyLightTheme,
    prefersDarkMode,  // Expose for testing
    addThemeChangeListener,  // Expose for testing
    handleThemeChange  // Expose for testing
};