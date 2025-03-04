function initializeTheme() {
    // Get theme stylesheet link
    const themeStylesheet = document.getElementById('theme-stylesheet');
    
    // Check if system prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
    
    // Add system theme change listener
    if (window.matchMedia) {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Listen for changes to system theme
        prefersDarkScheme.addEventListener('change', function(e) {
            if (e.matches) {
                applyDarkTheme();
            } else {
                applyLightTheme();
            }
        });
    }
    
    console.log('Theme initialized based on system preferences');
}

// Apply dark theme
function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    document.getElementById('theme-stylesheet').href = 'css/themes/dark.css';
    
    console.log('Applied dark theme based on system preference');
}

// Apply light theme
function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    document.getElementById('theme-stylesheet').href = 'css/themes/light.css';
    
    console.log('Applied light theme based on system preference');
}

module.exports = {
    initializeTheme,
    applyDarkTheme,
    applyLightTheme
};