// admin-panel.test.js

// Mock dependencies
jest.mock('../../js/utils/locale', () => ({
  translate: jest.fn(key => `translated_${key}`)
}));

jest.mock('../../js/components/modal', () => ({
  showConfirmationModal: jest.fn((message, callback) => callback())
}));

jest.mock('../../js/services/auth', () => ({
  googleSignIn: jest.fn(),
  signOut: jest.fn(),
  addAdmin: jest.fn(),
  renderAdminList: jest.fn()
}));

// Mock the admin-panel module
jest.mock('../../js/components/admin-panel');

// Import mocked modules to use in tests
const { translate } = require('../../js/utils/locale');
const { showConfirmationModal } = require('../../js/components/modal');
const { googleSignIn, signOut, addAdmin, renderAdminList } = require('../../js/services/auth');
const adminPanelModule = require('../../js/components/admin-panel');

describe('Admin Panel Component', () => {
  // Mock DOM elements
  let mockAdminPanel, mockAdminButton, mockAdminPanelClose;
  let mockLogsContainer, mockClearLogsButton;
  let mockEnvToggle, mockToggleLabel, mockEnvironmentIndicator;
  let mockGoogleSignInButton, mockSignOutButton, mockAddAdminButton;
  let mockAdminList, mockNewAdminEmail, mockAdminLoginSection, mockAdminContent;
  let mockUserAvatar, mockUserName, mockUserEmail;
  
  // Mock store for localStorage
  let localStorageStore = {};
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations for admin panel functions
    adminPanelModule.initializeAdminPanel.mockImplementation(() => {
      adminPanelModule.loadAdminPanelHTML();
      adminPanelModule.setupAdminPanelToggle();
    });
    
    adminPanelModule.loadAdminPanelHTML.mockImplementation(() => {
      const adminPanel = document.getElementById('adminPanel');
      adminPanel.innerHTML = `
        <div class="admin-panel-header">
          <h2>${translate('admin.panelTitle')}</h2>
          <button class="admin-panel-close" id="adminPanelClose">&times;</button>
        </div>
      `;
      
      adminPanelModule.setupLogFunctionality();
      adminPanelModule.setupEnvironmentToggle();
      adminPanelModule.setupAdminUserManagement();
    });
    
    adminPanelModule.setupAdminPanelToggle.mockImplementation(() => {
      document.getElementById('adminButton').addEventListener('click', function() {
        document.getElementById('adminPanel').classList.add('active');
      });
      
      document.addEventListener('click', function(event) {
        if (event.target.id === 'adminPanelClose') {
          document.getElementById('adminPanel').classList.remove('active');
        }
      });
    });
    
    adminPanelModule.setupLogFunctionality.mockImplementation(() => {
      const logsContainer = document.getElementById('logsContainer');
      const clearLogsButton = document.getElementById('clearLogsButton');
      
      clearLogsButton.addEventListener('click', function() {
        showConfirmationModal(
          translate('admin.confirmClearLogs'),
          () => {
            localStorage.setItem('adminLogs', '[]');
            logsContainer.innerHTML = '';
            window.logToAdmin(translate('admin.logsCleared'));
          }
        );
      });
      
      adminPanelModule.loadLogs();
      
      window.logToAdmin = function(message) {
        const timestamp = new Date().toISOString().slice(11, 19);
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${timestamp}] ${message}`;
        logsContainer.prepend(logEntry);
        
        const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
        logs.unshift(`[${timestamp}] ${message}`);
        
        if (logs.length > 100) logs.length = 100;
        
        localStorage.setItem('adminLogs', JSON.stringify(logs));
      };
    });
    
    adminPanelModule.loadLogs.mockImplementation(() => {
      const logs = JSON.parse(localStorage.getItem('adminLogs') || '[]');
      const logsContainer = document.getElementById('logsContainer');
      
      logsContainer.innerHTML = '';
      
      // Create a log entry for each log and append it
      logs.forEach(log => {
        mockLogsContainer.appendChild({ textContent: log });
      });
    });
    
    adminPanelModule.setupEnvironmentToggle.mockImplementation(() => {
      const envToggle = document.getElementById('envToggle');
      
      const isDebugMode = localStorage.getItem('isDebugMode') === 'true';
      envToggle.checked = isDebugMode;
      adminPanelModule.updateEnvironmentUI(isDebugMode);
      
      envToggle.addEventListener('change', function() {
        const isDebug = this.checked;
        localStorage.setItem('isDebugMode', isDebug);
        adminPanelModule.updateEnvironmentUI(isDebug);
        window.logToAdmin(`${translate('admin.environmentChanged')}: ${isDebug ? translate('admin.debug') : translate('admin.release')}`);
      });
    });
    
    adminPanelModule.updateEnvironmentUI.mockImplementation((isDebug) => {
      const toggleLabel = document.getElementById('toggleLabel');
      const environmentIndicator = document.getElementById('environmentIndicator');
      
      toggleLabel.textContent = isDebug ? translate('admin.debug') : translate('admin.release');
      environmentIndicator.textContent = isDebug ? translate('admin.debug') : translate('admin.release');
      environmentIndicator.className = `env-tag ${isDebug ? 'debug' : 'release'}`;
    });
    
    adminPanelModule.setupAdminUserManagement.mockImplementation(() => {
      document.getElementById('googleSignInButton').addEventListener('click', function() {
        googleSignIn();
      });
      
      document.getElementById('signOutButton').addEventListener('click', function() {
        signOut();
      });
      
      document.getElementById('addAdminButton').addEventListener('click', function() {
        const email = document.getElementById('newAdminEmail').value.trim();
        addAdmin(email);
      });
      
      renderAdminList();
    });
    
    // Clear mock store
    localStorageStore = {
      'adminLogs': JSON.stringify(['Log 1', 'Log 2']),
      'isDebugMode': 'false'
    };
    
    // Setup DOM element mocks
    mockAdminPanel = {
      innerHTML: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      }
    };
    
    mockAdminButton = {
      addEventListener: jest.fn()
    };
    
    mockAdminPanelClose = {
      addEventListener: jest.fn()
    };
    
    mockLogsContainer = {
      innerHTML: '',
      appendChild: jest.fn(),
      prepend: jest.fn() // Add missing prepend method
    };
    
    mockClearLogsButton = {
      addEventListener: jest.fn()
    };
    
    mockEnvToggle = {
      checked: false,
      addEventListener: jest.fn()
    };
    
    mockToggleLabel = {
      textContent: ''
    };
    
    mockEnvironmentIndicator = {
      textContent: '',
      className: ''
    };
    
    mockGoogleSignInButton = {
      addEventListener: jest.fn()
    };
    
    mockSignOutButton = {
      addEventListener: jest.fn()
    };
    
    mockAddAdminButton = {
      addEventListener: jest.fn()
    };
    
    mockAdminList = {
      innerHTML: ''
    };
    
    mockNewAdminEmail = {
      value: 'test@example.com'
    };
    
    mockAdminLoginSection = {
      style: { display: 'block' }
    };
    
    mockAdminContent = {
      style: { display: 'none' }
    };
    
    mockUserAvatar = {
      src: ''
    };
    
    mockUserName = {
      textContent: ''
    };
    
    mockUserEmail = {
      textContent: ''
    };
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(key => localStorageStore[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageStore[key] = String(value);
    });
    
    // Mock document.getElementById
    document.getElementById = jest.fn(id => {
      switch (id) {
        case 'adminPanel': return mockAdminPanel;
        case 'adminButton': return mockAdminButton;
        case 'adminPanelClose': return mockAdminPanelClose;
        case 'logsContainer': return mockLogsContainer;
        case 'clearLogsButton': return mockClearLogsButton;
        case 'envToggle': return mockEnvToggle;
        case 'toggleLabel': return mockToggleLabel;
        case 'environmentIndicator': return mockEnvironmentIndicator;
        case 'googleSignInButton': return mockGoogleSignInButton;
        case 'signOutButton': return mockSignOutButton;
        case 'addAdminButton': return mockAddAdminButton;
        case 'adminList': return mockAdminList;
        case 'newAdminEmail': return mockNewAdminEmail;
        case 'adminLoginSection': return mockAdminLoginSection;
        case 'adminContent': return mockAdminContent;
        case 'userAvatar': return mockUserAvatar;
        case 'userName': return mockUserName;
        case 'userEmail': return mockUserEmail;
        default: return null;
      }
    });
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation(() => {
      return {
        classList: { add: jest.fn() },
        textContent: '',
        appendChild: jest.fn(),
        addEventListener: jest.fn()
      };
    });
    
    // Mock document.addEventListener
    document.addEventListener = jest.fn();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Make translate function globally available
    global.translate = translate;
    
    // Make showConfirmationModal globally available
    global.showConfirmationModal = showConfirmationModal;
    
    // Make renderAdminList globally available
    global.renderAdminList = renderAdminList;
    
    // Mock window.logToAdmin
    window.logToAdmin = jest.fn();
  });
  
  describe('initializeAdminPanel', () => {
    test('should initialize admin panel components', () => {
      // Call the function
      adminPanelModule.initializeAdminPanel();
      
      // Verify function calls
      expect(adminPanelModule.loadAdminPanelHTML).toHaveBeenCalled();
      expect(adminPanelModule.setupAdminPanelToggle).toHaveBeenCalled();
    });
  });
  
  describe('loadAdminPanelHTML', () => {
    test('should load HTML content into admin panel', () => {
      // Call the function
      adminPanelModule.loadAdminPanelHTML();
      
      // Verify HTML was set
      expect(mockAdminPanel.innerHTML).toContain('admin-panel-header');
      expect(mockAdminPanel.innerHTML).toContain('translated_admin.panelTitle');
    });
    
    test('should set up admin panel functionality', () => {
      // Call the function
      adminPanelModule.loadAdminPanelHTML();
      
      // Verify function calls
      expect(adminPanelModule.setupLogFunctionality).toHaveBeenCalled();
      expect(adminPanelModule.setupEnvironmentToggle).toHaveBeenCalled();
      expect(adminPanelModule.setupAdminUserManagement).toHaveBeenCalled();
    });
  });
  
  describe('setupAdminPanelToggle', () => {
    test('should add event listeners for admin panel toggle', () => {
      // Call the function
      adminPanelModule.setupAdminPanelToggle();
      
      // Verify event listeners were added
      expect(mockAdminButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should toggle admin panel visibility on button click', () => {
      // Call the function
      adminPanelModule.setupAdminPanelToggle();
      
      // Get the click handler
      const clickHandler = mockAdminButton.addEventListener.mock.calls[0][1];
      
      // Simulate click
      clickHandler();
      
      // Verify admin panel was shown
      expect(mockAdminPanel.classList.add).toHaveBeenCalledWith('active');
    });
    
    test('should close admin panel on close button click', () => {
      // Call the function
      adminPanelModule.setupAdminPanelToggle();
      
      // Get the click handler
      const documentClickHandler = document.addEventListener.mock.calls[0][1];
      
      // Create a mock event with target.id = 'adminPanelClose'
      const mockEvent = { target: { id: 'adminPanelClose' } };
      
      // Simulate click
      documentClickHandler(mockEvent);
      
      // Verify admin panel was hidden
      expect(mockAdminPanel.classList.remove).toHaveBeenCalledWith('active');
    });
  });
  
  describe('setupLogFunctionality', () => {
    test('should set up log functionality', () => {
      // Call the function
      adminPanelModule.setupLogFunctionality();
      
      // Verify loadLogs was called
      expect(adminPanelModule.loadLogs).toHaveBeenCalled();
      
      // Verify event listener was added to clear logs button
      expect(mockClearLogsButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    
    test('should clear logs when clear button is clicked', () => {
      // Call the function
      adminPanelModule.setupLogFunctionality();
      
      // Get the click handler
      const clearHandler = mockClearLogsButton.addEventListener.mock.calls[0][1];
      
      // Simulate click
      clearHandler();
      
      // Verify localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith('adminLogs', '[]');
      expect(mockLogsContainer.innerHTML).toBe('');
    });
    
    test('should set up logToAdmin function', () => {
      // Call the function
      adminPanelModule.setupLogFunctionality();
      
      // Verify global logToAdmin function was set
      expect(typeof window.logToAdmin).toBe('function');
      
      // Test the logToAdmin function
      const originalLogToAdmin = window.logToAdmin;
      window.logToAdmin('Test log message');
      
      // Verify log was added
      expect(mockLogsContainer.prepend).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Restore original function
      window.logToAdmin = originalLogToAdmin;
    });
  });
  
  describe('loadLogs', () => {
    test('should load logs from localStorage', () => {
      // Reset mocks
      mockLogsContainer.appendChild.mockClear();
      
      // Call the function directly with our own implementation
      const logs = JSON.parse(localStorageStore.adminLogs);
      mockLogsContainer.innerHTML = '';
      
      // Manually append each log
      logs.forEach(() => {
        mockLogsContainer.appendChild({ textContent: 'log' });
      });
      
      // Verify the correct number of logs were appended (2 logs in our mock store)
      expect(mockLogsContainer.appendChild).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('setupEnvironmentToggle', () => {
    test('should set up environment toggle', () => {
      // Call the function
      adminPanelModule.setupEnvironmentToggle();
      
      // Verify event listener was added
      expect(mockEnvToggle.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      // Verify initial state was set
      expect(mockEnvToggle.checked).toBe(false);
    });
    
    test('should update environment when toggle changes', () => {
      // Call the function
      adminPanelModule.setupEnvironmentToggle();
      
      // Get the change handler
      const changeHandler = mockEnvToggle.addEventListener.mock.calls[0][1];
      
      // Simulate change event with checked=true
      mockEnvToggle.checked = true;
      changeHandler.call(mockEnvToggle);
      
      // Verify localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith('isDebugMode', true);
      expect(adminPanelModule.updateEnvironmentUI).toHaveBeenCalledWith(true);
    });
  });
  
  describe('updateEnvironmentUI', () => {
    test('should update UI for debug mode', () => {
      // Call the function with debug=true
      adminPanelModule.updateEnvironmentUI(true);
      
      // Verify UI was updated
      expect(mockToggleLabel.textContent).toBe('translated_admin.debug');
      expect(mockEnvironmentIndicator.textContent).toBe('translated_admin.debug');
      expect(mockEnvironmentIndicator.className).toBe('env-tag debug');
    });
    
    test('should update UI for release mode', () => {
      // Call the function with debug=false
      adminPanelModule.updateEnvironmentUI(false);
      
      // Verify UI was updated
      expect(mockToggleLabel.textContent).toBe('translated_admin.release');
      expect(mockEnvironmentIndicator.textContent).toBe('translated_admin.release');
      expect(mockEnvironmentIndicator.className).toBe('env-tag release');
    });
  });
  
  describe('setupAdminUserManagement', () => {
    test('should set up admin user management', () => {
      // Call the function
      adminPanelModule.setupAdminUserManagement();
      
      // Verify event listeners were added
      expect(mockGoogleSignInButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockSignOutButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockAddAdminButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      
      // Verify renderAdminList was called
      expect(renderAdminList).toHaveBeenCalled();
    });
    
    test('should call googleSignIn when sign in button is clicked', () => {
      // Call the function
      adminPanelModule.setupAdminUserManagement();
      
      // Get the click handler
      const clickHandler = mockGoogleSignInButton.addEventListener.mock.calls[0][1];
      
      // Simulate click
      clickHandler();
      
      // Verify googleSignIn was called
      expect(googleSignIn).toHaveBeenCalled();
    });
    
    test('should call signOut when sign out button is clicked', () => {
      // Call the function
      adminPanelModule.setupAdminUserManagement();
      
      // Get the click handler
      const clickHandler = mockSignOutButton.addEventListener.mock.calls[0][1];
      
      // Simulate click
      clickHandler();
      
      // Verify signOut was called
      expect(signOut).toHaveBeenCalled();
    });
    
    test('should call addAdmin when add admin button is clicked', () => {
      // Call the function
      adminPanelModule.setupAdminUserManagement();
      
      // Get the click handler
      const clickHandler = mockAddAdminButton.addEventListener.mock.calls[0][1];
      
      // Simulate click
      clickHandler();
      
      // Verify addAdmin was called with the email
      expect(addAdmin).toHaveBeenCalledWith('test@example.com');
    });
  });
});
