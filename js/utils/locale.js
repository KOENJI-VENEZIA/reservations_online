// Current language
let currentLanguage = 'en';

// Translations object
let translations = {};

// Initialize localization
function initializeLocalization() {
    // Load translations for current language
    setLanguage(currentLanguage);
}

// Set language and update elements
async function setLanguage(lang) {
    // If language is not provided or invalid, use default
    if (!lang || typeof lang !== 'string') {
        lang = 'en';
    }

    // Set current language
    currentLanguage = lang;

    // Load language file
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load language file: ${response.status}`);
        }
        translations = await response.json();
    } catch (error) {
        console.error('Error loading language file:', error);
        // Fallback to empty translations
        translations = {};
    }

    // Update all elements with translations
    updateAllTranslations();
}

// Update all elements with translations
function updateAllTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        element.textContent = getTranslation(key);
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

// Update translations and language
function updateTranslations(language, newTranslations = null) {
    if (newTranslations) {
        translations = newTranslations;
    }
    currentLanguage = language;
    updateAllTranslations();
}

// Make functions available globally
window.translate = getTranslation;
window.updateTranslations = updateTranslations;
window.updateAllTranslations = updateAllTranslations;

// Export functions for testing
module.exports = {
    getTranslation,
    updateAllTranslations, // Export this instead of translate
    updateTranslations
};
