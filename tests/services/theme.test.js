const { applyDarkTheme, applyLightTheme } = require('../../../js/services/theme');

describe('Theme Services', () => {
    let mockThemeStylesheet;

    beforeEach(() => {
        // Mock document.body
        document.body = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        };

        // Mock theme stylesheet
        mockThemeStylesheet = {
            href: ''
        };

        // Mock document.getElementById
        document.getElementById = jest.fn().mockReturnValue(mockThemeStylesheet);
    });

    describe('applyDarkTheme', () => {
        test('should add dark-theme class to body', () => {
            applyDarkTheme();
            expect(document.body.classList.add).toHaveBeenCalledWith('dark-theme');
        });

        test('should set dark theme stylesheet href', () => {
            applyDarkTheme();
            expect(mockThemeStylesheet.href).toBe('css/themes/dark.css');
        });

        test('should log theme application', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            applyDarkTheme();
            expect(consoleSpy).toHaveBeenCalledWith('Applied dark theme based on system preference');
        });
    });

    describe('applyLightTheme', () => {
        test('should remove dark-theme class from body', () => {
            applyLightTheme();
            expect(document.body.classList.remove).toHaveBeenCalledWith('dark-theme');
        });

        test('should set light theme stylesheet href', () => {
            applyLightTheme();
            expect(mockThemeStylesheet.href).toBe('css/themes/light.css');
        });

        test('should log theme application', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            applyLightTheme();
            expect(consoleSpy).toHaveBeenCalledWith('Applied light theme based on system preference');
        });
    });
}); 