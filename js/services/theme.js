// Initialize theme functionality
function initializeTheme() {
    // Get theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    
    // Get theme stylesheet link
    const themeStylesheet = document.getElementById('theme-stylesheet');
    
    // Check if dark theme is saved in localStorage
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    
    // Apply saved theme or default to light
    if (isDarkTheme) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
    
    // Add click event listener to theme toggle
    themeToggle.addEventListener('click', function() {
        // Toggle theme
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        
        if (currentTheme === 'light') {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    });
    
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
}

// Apply dark theme
function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    document.getElementById('theme-stylesheet').href = 'css/themes/dark.css';
    localStorage.setItem('darkTheme', 'true');
    
    // Log theme change
    console.log('Applied dark theme');
}

// Apply light theme
function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    document.getElementById('theme-stylesheet').href = 'css/themes/light.css';
    localStorage.setItem('darkTheme', 'false');
    
    // Log theme change
    console.log('Applied light theme');
}
