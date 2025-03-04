// Current language
let currentLanguage = 'en';

// Translations cache
let translations = {};

// Initialize localization
function initializeLocalization() {
    // Get language from localStorage or set default
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    // Set language selector value
    const languageSelect = document.getElementById('language-select');
    languageSelect.value = savedLanguage;
    
    // Add event listener for language change
    languageSelect.addEventListener('change', function() {
        setLanguage(this.value);
    });
    
    // Load initial language
    setLanguage(savedLanguage);
}

// Set active language
async function setLanguage(lang) {
    // Check if language is already loaded
    if (!translations[lang]) {
        try {
            // Load language file
            const response = await fetch(`locales/${lang}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language: ${lang}`);
            }
            
            translations[lang] = await response.json();
        } catch (error) {
            console.error('Error loading language file:', error);
            
            // Fall back to English if there's an error
            if (lang !== 'en') {
                return setLanguage('en');
            }
            
            // If even English fails, set empty translations
            translations[lang] = {};
        }
    }
    
    // Update current language
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    updateTranslations();
    
    // Update document language
    document.documentElement.lang = lang;
    
    // Log language change
    console.log(`Language changed to: ${lang}`);
}

// Update all translatable elements
function updateTranslations() {
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        
        // Update element content if translation exists
        if (translation) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

// Get translation for a key
function getTranslation(key) {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let result = translations[currentLanguage];
    
    // Traverse the nested object
    for (const k of keys) {
        if (result && result[k] !== undefined) {
            result = result[k];
        } else {
            // Key not found
            return key;
        }
    }
    
    return result;
}

// Update translations for all elements
function translate() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        element.textContent = getTranslation(key);
    });
}

// Update translations and language
function updateTranslations(language, newTranslations = null) {
    if (newTranslations) {
        translations = newTranslations;
    }
    currentLanguage = language;
    translate();
}

// Make functions available globally
window.translate = translate;
window.updateTranslations = updateTranslations;

// Export functions for testing
module.exports = {
    getTranslation,
    translate,
    updateTranslations
};
