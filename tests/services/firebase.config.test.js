/**
 * firebase-config.test.js
 */

// Mock the firebase-init module
jest.mock('../../js/services/firebase-init', () => {
  return {
    __esModule: true,
    default: {
      db: { collection: jest.fn() },
      functions: {},
      auth: {}
    }
  };
});

// Import the module under test
import {
  isDebugEnvironment,
  getCollectionName,
  generateUUID,
  logToAdmin,
  db,
  functions,
  auth
} from '../../js/services/firebase-config';

describe('Firebase Configuration', () => {
  let originalRandom;

  beforeEach(() => {
    jest.clearAllMocks();

    // Save and mock Math.random
    originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore Math.random
    Math.random = originalRandom;
  });

  // ---------------------- isDebugEnvironment ----------------------
  describe('isDebugEnvironment', () => {
    test('returns true when isDebugMode is "true" in localStorage', () => {
      localStorage.getItem.mockReturnValue('true');
      expect(isDebugEnvironment()).toBe(true);
    });

    test('returns false when isDebugMode is "false"', () => {
      localStorage.getItem.mockReturnValue('false');
      expect(isDebugEnvironment()).toBe(false);
    });

    test('returns false when localStorage does not have isDebugMode', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(isDebugEnvironment()).toBe(false);
    });
  });

  // ---------------------- getCollectionName ----------------------
  describe('getCollectionName', () => {
    test('returns "reservations" if in debug mode', () => {
      localStorage.getItem.mockReturnValue('true');
      expect(getCollectionName()).toBe('reservations');
    });

    test('returns "reservations_release" if not in debug mode', () => {
      localStorage.getItem.mockReturnValue('false');
      expect(getCollectionName()).toBe('reservations_release');
    });
  });

  // ---------------------- generateUUID ----------------------
  describe('generateUUID', () => {
    test('generates a valid RFC4122 UUID', () => {
      const uuid = generateUUID();

      // Check the type and pattern
      expect(typeof uuid).toBe('string');
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );

      // With Math.random mocked to 0.5, expect a stable UUID
      expect(uuid).toBe('88888888-8888-4888-8888-888888888888');
    });
  });

  // ---------------------- logToAdmin ----------------------
  describe('logToAdmin', () => {
    test('calls window.logToAdmin if it exists', () => {
      window.logToAdmin = jest.fn();
      logToAdmin('Test Message');
      expect(window.logToAdmin).toHaveBeenCalledWith('Test Message');
    });

    test('falls back to console.log if window.logToAdmin not found', () => {
      delete window.logToAdmin;
      logToAdmin('Test Message');
      expect(console.log).toHaveBeenCalledWith('[Admin Log]', 'Test Message');
    });
  });

  // ---------------------- Firebase Services ----------------------
  describe('Firebase Services', () => {
    test('exports Firebase services', () => {
      expect(db).toBeDefined();
      expect(functions).toBeDefined();
      expect(auth).toBeDefined();
    });
  });
});
