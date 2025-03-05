// Current language
let currentLanguage = 'en';

// Translations object - initialized empty
let translations = {};

// Initialize localization
export function initializeLocalization() {
    // Get browser language or use default
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'ja', 'it'];
    
    // Use browser language if supported, otherwise default to English
    const initialLang = supportedLanguages.includes(browserLang) ? browserLang : 'en';
    
    // Load translations for initial language
    setLanguage(initialLang);
    
    // Set the language selector to match the current language
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        
        // Add event listener for language changes
        languageSelect.addEventListener('change', function() {
            setLanguage(this.value);
        });
    }
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
        // Keep default translations
    }

    // Update all elements with translations
    updateAllTranslations();
}

// Update all elements with translations
export function updateAllTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    if (!elements || elements.length === 0) return;
    
    elements.forEach(element => {
        const key = element.dataset.translate;
        element.textContent = getTranslation(key);
    });
}

// Get translation for a key
export function getTranslation(key) {
    if (!key) return '';
    
    // Normal environment behavior - use local translations
    const keys = key.split('.');
    let result = translations;
    
    if (!result) return key;
    
    // Navigate through the nested object
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return key;
        }
    }
    
    return result;
}

// Update translations and language
export function updateTranslations(language, newTranslations = null) {
    if (newTranslations) {
        translations = newTranslations;
    }
    
    currentLanguage = language;
    
    // Call the local function
    updateAllTranslations();
}

// Alias for setLanguage for better API naming
export function setLocale(lang) {
    return setLanguage(lang);
}

// Get current locale
export function getCurrentLocale() {
    return currentLanguage;
}

// Alias for updateAllTranslations for better API naming
export function translateUI() {
    return updateAllTranslations();
}

// Make functions available globally
window.translate = getTranslation;
window.updateTranslations = updateTranslations;
window.updateAllTranslations = updateAllTranslations;

// Initialize localization when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLocalization);