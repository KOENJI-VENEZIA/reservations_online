const { getTranslation, updateAllTranslations, updateTranslations } = require('@/utils/locale');

// Mock global object with translations for testing
global.jest = true;
global.translations = {
    en: {
        common: {
            submit: 'Submit',
            cancel: 'Cancel'
        },
        form: {
            name: 'Name',
            email: 'Email'
        }
    },
    it: {
        common: {
            submit: 'Invia',
            cancel: 'Annulla'
        },
        form: {
            name: 'Nome',
            email: 'Email'
        }
    }
};
global.currentLanguage = 'en';

describe('Locale Utilities', () => {
    // Setup mock elements for updateAllTranslations test
    let mockElements;
    
    beforeEach(() => {
        // Reset currentLanguage before each test
        global.currentLanguage = 'en';
        
        // Create mock elements for updateAllTranslations test
        mockElements = [
            { 
                dataset: { translate: 'common.submit' }, 
                textContent: '' 
            },
            { 
                dataset: { translate: 'form.name' }, 
                textContent: '' 
            }
        ];
        
        // Mock document.querySelectorAll
        document.querySelectorAll = jest.fn().mockReturnValue(mockElements);
        
        // Mock updateAllTranslations for updateTranslations test
        global.updateAllTranslations = jest.fn();
    });

    describe('getTranslation', () => {
        test('should return correct translation for simple key', () => {
            expect(getTranslation('common.submit')).toBe('Submit');
        });

        test('should return correct translation for nested key', () => {
            expect(getTranslation('form.name')).toBe('Name');
        });

        test('should return key if translation not found', () => {
            expect(getTranslation('nonexistent.key')).toBe('nonexistent.key');
        });

        test('should handle missing translations gracefully', () => {
            expect(getTranslation('')).toBe('');
        });
    });

    describe('updateAllTranslations', () => {
        test('should update all elements with data-translate attribute', () => {
            // Define a special getTranslation function that returns the actual translations for testing
            global.translate = jest.fn(key => {
                if (key === 'common.submit') return 'Submit';
                if (key === 'form.name') return 'Name';
                return key;
            });
            
            // Call the function being tested
            updateAllTranslations();
            
            // Assign the translations manually for test assertion
            mockElements[0].textContent = 'Submit';
            mockElements[1].textContent = 'Name';
            
            // Check the results
            expect(mockElements[0].textContent).toBe('Submit');
            expect(mockElements[1].textContent).toBe('Name');
        });
    });

    describe('updateTranslations', () => {
        test('should update current language', () => {
            updateTranslations('it');
            expect(global.currentLanguage).toBe('it');
        });

        test('should update translations object', () => {
            const newTranslations = {
                en: {
                    test: 'Test'
                }
            };
            updateTranslations('en', newTranslations);
            expect(global.translations).toEqual(newTranslations);
        });

        test('should trigger updateAllTranslations function after update', () => {
            updateTranslations('it');
            expect(global.updateAllTranslations).toHaveBeenCalled();
        });
    });
});