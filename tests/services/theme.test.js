const { applyDarkTheme, applyLightTheme } = require('@/services/theme');

describe('Theme Services', () => {
    let mockThemeStylesheet;

    beforeEach(() => {
        // Create Jest mock functions for classList methods
        const mockAdd = jest.fn();
        const mockRemove = jest.fn();
        
        // Ensure document.body exists
        if (!document.body) {
            // This should not happen with jsdom, but just in case
            Object.defineProperty(document, 'body', {
                value: document.createElement('body'),
                writable: true
            });
        }
        
        // Save original classList if it exists
        const originalClassList = document.body.classList;
        
        // Replace classList methods with mocks
        Object.defineProperty(document.body, 'classList', {
            value: {
                add: mockAdd,
                remove: mockRemove,
                // Keep any other existing methods
                ...(originalClassList || {})
            },
            writable: true,
            configurable: true
        });

        // Mock theme stylesheet
        mockThemeStylesheet = {
            href: ''
        };

        // Mock document.getElementById
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'theme-stylesheet') {
                return mockThemeStylesheet;
            }
            return null;
        });
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