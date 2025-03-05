import * as themeModule from '../../js/services/theme.js';

describe('Theme Services', () => {
    // Setup DOM mocks
    beforeEach(() => {
        // Instead of overwriting document.body.classList, use spies
        jest.spyOn(document.body.classList, 'add');
        jest.spyOn(document.body.classList, 'remove');
        // Optionally, spy on contains if needed
        jest.spyOn(document.body.classList, 'contains');
        
        // Create a mock stylesheet element
        const mockStylesheet = { href: '' };
        
        // Mock document.getElementById to return our mock element
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'theme-stylesheet') {
                return mockStylesheet;
            }
            return null;
        });
        
        // Mock window.matchMedia
        window.matchMedia = jest.fn().mockImplementation(query => {
            return {
                matches: query === '(prefers-color-scheme: dark)',
                addEventListener: jest.fn()
            };
        });
        
        // Mock console methods
        console.log = jest.fn();
        console.error = jest.fn();
        
        // Reset all mocks before each test
        jest.clearAllMocks();
    });
    
    // Clean up after tests
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('applyDarkTheme', () => {
        test('should add dark-theme class to body', () => {
            themeModule.applyDarkTheme();
            expect(document.body.classList.add).toHaveBeenCalledWith('dark-theme');
        });
        
        test('should set dark theme stylesheet href', () => {
            themeModule.applyDarkTheme();
            const stylesheet = document.getElementById('theme-stylesheet');
            expect(stylesheet.href).toBe('css/themes/dark.css');
        });
        
        test('should log theme application', () => {
            themeModule.applyDarkTheme();
            expect(console.log).toHaveBeenCalled();
        });
    });
    
    describe('applyLightTheme', () => {
        test('should remove dark-theme class from body', () => {
            themeModule.applyLightTheme();
            expect(document.body.classList.remove).toHaveBeenCalledWith('dark-theme');
        });
        
        test('should set light theme stylesheet href', () => {
            themeModule.applyLightTheme();
            const stylesheet = document.getElementById('theme-stylesheet');
            expect(stylesheet.href).toBe('css/themes/light.css');
        });
        
        test('should log theme application', () => {
            themeModule.applyLightTheme();
            expect(console.log).toHaveBeenCalled();
        });
    });
    
    describe('prefersDarkMode', () => {
        test('should return true when system prefers dark mode', () => {
            window.matchMedia = jest.fn().mockImplementation(query => {
                return {
                    matches: query === '(prefers-color-scheme: dark)'
                };
            });
            
            expect(themeModule.prefersDarkMode()).toBe(true);
        });
        
        test('should return false when system prefers light mode', () => {
            window.matchMedia = jest.fn().mockImplementation(() => {
                return { matches: false };
            });
            
            expect(themeModule.prefersDarkMode()).toBe(false);
        });
        
        test('should return false when matchMedia is not available', () => {
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = undefined;
            
            expect(themeModule.prefersDarkMode()).toBe(false);
            
            window.matchMedia = originalMatchMedia;
        });
    });
    
    describe('addThemeChangeListener', () => {
        test('should add event listener when matchMedia is available', () => {
            const addEventListener = jest.fn();
            
            window.matchMedia = jest.fn().mockReturnValue({
                matches: false,
                addEventListener
            });
            
            const result = themeModule.addThemeChangeListener();
            
            expect(result).toBe(true);
            expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });
        
        test('should return false when matchMedia is not available', () => {
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = undefined;
            
            const result = themeModule.addThemeChangeListener();
            
            expect(result).toBe(false);
            
            window.matchMedia = originalMatchMedia;
        });
    });
    
    describe('handleThemeChange', () => {
        test('should call appropriate theme functions based on matches', () => {
            // Test dark theme (matches: true)
            themeModule.handleThemeChange({ matches: true });
            expect(document.body.classList.add).toHaveBeenCalledWith('dark-theme');
            expect(document.body.classList.remove).not.toHaveBeenCalled();
            
            // Reset mocks
            jest.clearAllMocks();
            
            // Test light theme (matches: false)
            themeModule.handleThemeChange({ matches: false });
            expect(document.body.classList.remove).toHaveBeenCalledWith('dark-theme');
            expect(document.body.classList.add).not.toHaveBeenCalled();
        });
    });
    
    // describe('initializeTheme', () => {
    //     // Create direct mocks for the functions
    //     const originalPrefersDarkMode = themeModule.prefersDarkMode;
    //     const originalApplyDarkTheme = themeModule.applyDarkTheme;
    //     const originalApplyLightTheme = themeModule.applyLightTheme;
    //     const originalAddThemeChangeListener = themeModule.addThemeChangeListener;
        
    //     beforeEach(() => {
    //         // Replace the functions with mocks
    //         themeModule.prefersDarkMode = jest.fn();
    //         themeModule.applyDarkTheme = jest.fn();
    //         themeModule.applyLightTheme = jest.fn();
    //         themeModule.addThemeChangeListener = jest.fn().mockReturnValue(true);
    //     });
        
    //     afterEach(() => {
    //         // Restore the original functions
    //         themeModule.prefersDarkMode = originalPrefersDarkMode;
    //         themeModule.applyDarkTheme = originalApplyDarkTheme;
    //         themeModule.applyLightTheme = originalApplyLightTheme;
    //         themeModule.addThemeChangeListener = originalAddThemeChangeListener;
    //     });
        
    //     test('applies dark theme when system prefers dark mode', () => {
    //         // Set up the mock to return true
    //         themeModule.prefersDarkMode.mockReturnValue(true);
            
    //         themeModule.initializeTheme();
            
    //         expect(themeModule.applyDarkTheme).toHaveBeenCalled();
    //         expect(themeModule.applyLightTheme).not.toHaveBeenCalled();
    //     });
        
    //     test('applies light theme when system does not prefer dark mode', () => {
    //         // Set up the mock to return false
    //         themeModule.prefersDarkMode.mockReturnValue(false);
            
    //         themeModule.initializeTheme();
            
    //         expect(themeModule.applyLightTheme).toHaveBeenCalled();
    //         expect(themeModule.applyDarkTheme).not.toHaveBeenCalled();
    //     });
    // });
});

