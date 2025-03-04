// reservations.test.js
const { createReservation, getReservationsByDate, getUpcomingReservations, getReservationsByEmail, updateReservationStatus, cancelReservation, updateReservation } = require('@/services/reservations');

describe('Reservations Service', () => {
  // Mock data
  const mockReservationData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    numberOfPersons: 2,
    dateString: '2023-05-01',
    category: 'dinner',
    startTime: '19:00',
    endTime: '21:00',
    notes: 'Test notes'
  };
  
  // Mock Firestore document and collection references
  let mockDoc, mockQuerySnapshot, mockCollection;
  
  beforeEach(() => {
    // Mock Firestore document
    mockDoc = {
      set: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    };
    
    // Mock query snapshot
    mockQuerySnapshot = {
      forEach: jest.fn(callback => {
        const mockDocs = [
          { data: () => ({ id: 'res1', name: 'John', dateString: '2023-05-01' }) },
          { data: () => ({ id: 'res2', name: 'Jane', dateString: '2023-05-02' }) }
        ];
        mockDocs.forEach(callback);
      })
    };
    
    // Mock collection reference
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockQuerySnapshot)
    };
    
    // Mock Firestore
    global.db = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    // Mock utilities
    global.generateUUID = jest.fn().mockReturnValue('test-uuid-123');
    global.getCollectionName = jest.fn().mockReturnValue('reservations');
    
    // Mock Date.now
    const originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValue(1234567890000);
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('createReservation', () => {
    test('should create a new reservation with correct data', async () => {
      const result = await createReservation(mockReservationData);
      
      // Check if collection and document were accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      expect(mockCollection.doc).toHaveBeenCalledWith('test-uuid-123');
      
      // Check if document was set with correct data
      expect(mockDoc.set).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        ...mockReservationData,
        creationDate: 1234567890,
        lastEditedOn: 1234567890,
        source: 'web'
      });
      
      // Check if result is correct
      expect(result).toEqual({
        id: 'test-uuid-123',
        ...mockReservationData,
        creationDate: 1234567890,
        lastEditedOn: 1234567890,
        source: 'web'
      });
    });
    
    test('should handle errors when creating reservation', async () => {
      // Make set method reject
      mockDoc.set.mockRejectedValue(new Error('Test error'));
      
      await expect(createReservation(mockReservationData)).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error creating reservation:', expect.any(Error));
    });
  });
  
  describe('getReservationsByDate', () => {
    test('should return reservations for a specific date', async () => {
      const result = await getReservationsByDate('2023-05-01');
      
      // Check if collection was accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      
      // Check if query was constructed correctly
      expect(mockCollection.where).toHaveBeenCalledWith('dateString', '==', '2023-05-01');
      
      // Check if result is correct
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'res1', name: 'John', dateString: '2023-05-01' });
    });
    
    test('should handle errors when getting reservations by date', async () => {
      // Make get method reject
      mockCollection.get.mockRejectedValue(new Error('Test error'));
      
      await expect(getReservationsByDate('2023-05-01')).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error getting reservations:', expect.any(Error));
    });
  });
  
  describe('getUpcomingReservations', () => {
    test('should return upcoming reservations', async () => {
      // Mock Date for consistent testing
      const originalDate = global.Date;
      const mockDate = new Date('2023-05-01');
      
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        
        static now() {
          return mockDate.getTime();
        }
      };
      
      // Add toISOString method to mockDate
      mockDate.toISOString = () => '2023-05-01T00:00:00.000Z';
      
      const result = await getUpcomingReservations();
      
      // Check if collection was accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      
      // Check if query was constructed correctly
      expect(mockCollection.where).toHaveBeenCalledWith('dateString', '>=', '2023-05-01');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('dateString');
      
      // Check if result is correct
      expect(result).toHaveLength(2);
      
      // Restore original Date
      global.Date = originalDate;
    });
    
    test('should handle errors when getting upcoming reservations', async () => {
      // Make get method reject
      mockCollection.get.mockRejectedValue(new Error('Test error'));
      
      await expect(getUpcomingReservations()).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error getting upcoming reservations:', expect.any(Error));
    });
  });
  
  describe('getReservationsByEmail', () => {
    test('should return reservations for a specific email', async () => {
      const result = await getReservationsByEmail('john@example.com');
      
      // Check if collection was accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      
      // Check if query was constructed correctly
      expect(mockCollection.where).toHaveBeenCalledWith('email', '==', 'john@example.com');
      expect(mockCollection.orderBy).toHaveBeenCalledWith('creationDate', 'desc');
      
      // Check if result is correct
      expect(result).toHaveLength(2);
    });
    
    test('should handle errors when getting reservations by email', async () => {
      // Make get method reject
      mockCollection.get.mockRejectedValue(new Error('Test error'));
      
      await expect(getReservationsByEmail('john@example.com')).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error getting customer reservations:', expect.any(Error));
    });
  });
  
  describe('updateReservationStatus', () => {
    test('should update reservation status', async () => {
      const result = await updateReservationStatus('res1', 'confirmed');
      
      // Check if collection and document were accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      expect(mockCollection.doc).toHaveBeenCalledWith('res1');
      
      // Check if update was called with correct data
      expect(mockDoc.update).toHaveBeenCalledWith({
        status: 'confirmed',
        lastEditedOn: 1234567890
      });
      
      // Check if result is correct
      expect(result).toEqual({
        id: 'res1',
        status: 'confirmed'
      });
    });
    
    test('should handle errors when updating status', async () => {
      // Make update method reject
      mockDoc.update.mockRejectedValue(new Error('Test error'));
      
      await expect(updateReservationStatus('res1', 'confirmed')).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error updating reservation status:', expect.any(Error));
    });
  });
  
  describe('cancelReservation', () => {
    test('should cancel a reservation with reason', async () => {
      // First update (status to cancelled)
      mockDoc.update.mockResolvedValueOnce({});
      // Second update (add cancellation reason)
      mockDoc.update.mockResolvedValueOnce({});
      
      await cancelReservation('res1', 'Customer request');
      
      // Check if document was updated twice (status, then reason)
      expect(mockDoc.update).toHaveBeenCalledTimes(2);
      expect(mockDoc.update).toHaveBeenNthCalledWith(2, {
        cancellationReason: 'Customer request'
      });
    });
    
    test('should use default reason if none provided', async () => {
      // First update (status to cancelled)
      mockDoc.update.mockResolvedValueOnce({});
      // Second update (add cancellation reason)
      mockDoc.update.mockResolvedValueOnce({});
      
      await cancelReservation('res1');
      
      // Check if document was updated with default reason
      expect(mockDoc.update).toHaveBeenNthCalledWith(2, {
        cancellationReason: 'Cancelled by customer'
      });
    });
  });
  
  describe('updateReservation', () => {
    test('should update reservation with provided updates', async () => {
      const updates = {
        numberOfPersons: 4,
        notes: 'Updated notes'
      };
      
      const result = await updateReservation('res1', updates);
      
      // Check if collection and document were accessed
      expect(global.db.collection).toHaveBeenCalledWith('reservations');
      expect(mockCollection.doc).toHaveBeenCalledWith('res1');
      
      // Check if update was called with correct data
      expect(mockDoc.update).toHaveBeenCalledWith({
        ...updates,
        lastEditedOn: 1234567890
      });
      
      // Check if result is correct
      expect(result).toEqual({
        id: 'res1',
        ...updates,
        lastEditedOn: 1234567890
      });
    });
    
    test('should handle errors when updating reservation', async () => {
      // Make update method reject
      mockDoc.update.mockRejectedValue(new Error('Test error'));
      
      await expect(updateReservation('res1', { notes: 'test' })).rejects.toThrow('Test error');
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalledWith('Error updating reservation:', expect.any(Error));
    });
  });
});
