const { getTranslation, translate, updateTranslations } = require('@/utils/locale');

describe('Locale Utilities', () => {
    beforeEach(() => {
        // Reset translations before each test
        window.translations = {
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
        window.currentLanguage = 'en';
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

    describe('translate', () => {
        beforeEach(() => {
            // Mock document.querySelectorAll
            document.querySelectorAll = jest.fn().mockReturnValue([
                { dataset: { translate: 'common.submit' }, textContent: '' },
                { dataset: { translate: 'form.name' }, textContent: '' }
            ]);
        });

        test('should update all elements with data-translate attribute', () => {
            translate();
            const elements = document.querySelectorAll('[data-translate]');
            expect(elements[0].textContent).toBe('Submit');
            expect(elements[1].textContent).toBe('Name');
        });
    });

    describe('updateTranslations', () => {
        test('should update current language', () => {
            updateTranslations('it');
            expect(window.currentLanguage).toBe('it');
        });

        test('should update translations object', () => {
            const newTranslations = {
                en: {
                    test: 'Test'
                }
            };
            updateTranslations('en', newTranslations);
            expect(window.translations).toEqual(newTranslations);
        });

        test('should trigger translate function after update', () => {
            const translateSpy = jest.spyOn(window, 'translate');
            updateTranslations('it');
            expect(translateSpy).toHaveBeenCalled();
        });
    });
}); 