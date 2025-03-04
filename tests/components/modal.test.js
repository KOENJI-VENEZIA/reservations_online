const { initializeModal, showConfirmationModal } = require('@/components/modal');

describe('Modal Component', () => {
    let mockModal;
    let mockCloseButton;
    let mockCancelButton;
    let mockConfirmButton;

    beforeEach(() => {
        // Mock DOM elements
        mockModal = {
            style: { display: 'none' },
            addEventListener: jest.fn(),
            id: 'confirmModal'
        };
        mockCloseButton = {
            addEventListener: jest.fn(),
            id: 'modalClose'
        };
        mockCancelButton = {
            addEventListener: jest.fn(),
            id: 'modalCancel'
        };
        mockConfirmButton = {
            addEventListener: jest.fn(),
            id: 'modalConfirm'
        };

        // Mock document.getElementById
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'confirmModal': return mockModal;
                case 'modalClose': return mockCloseButton;
                case 'modalCancel': return mockCancelButton;
                case 'modalConfirm': return mockConfirmButton;
                default: return null;
            }
        });
    });

    describe('initializeModal', () => {
        test('should set up event listeners for all buttons', () => {
            initializeModal();
            expect(mockCloseButton.addEventListener).toHaveBeenCalled();
            expect(mockCancelButton.addEventListener).toHaveBeenCalled();
            expect(mockConfirmButton.addEventListener).toHaveBeenCalled();
            expect(mockModal.addEventListener).toHaveBeenCalled();
        });

        test('should make showConfirmationModal available globally', () => {
            initializeModal();
            expect(window.showConfirmationModal).toBeDefined();
        });
    });

    describe('showConfirmationModal', () => {
        let mockCallback;

        beforeEach(() => {
            mockCallback = jest.fn();
            initializeModal();
        });

        test('should display modal', () => {
            showConfirmationModal('Test message', mockCallback);
            expect(mockModal.style.display).toBe('block');
        });

        test('should set callback function', () => {
            showConfirmationModal('Test message', mockCallback);
            // Simulate confirm button click
            const confirmClickHandler = mockConfirmButton.addEventListener.mock.calls[0][1];
            confirmClickHandler();
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should close modal when clicking close button', () => {
            showConfirmationModal('Test message', mockCallback);
            // Simulate close button click
            const closeClickHandler = mockCloseButton.addEventListener.mock.calls[0][1];
            closeClickHandler();
            expect(mockModal.style.display).toBe('none');
        });

        test('should close modal when clicking cancel button', () => {
            showConfirmationModal('Test message', mockCallback);
            // Simulate cancel button click
            const cancelClickHandler = mockCancelButton.addEventListener.mock.calls[0][1];
            cancelClickHandler();
            expect(mockModal.style.display).toBe('none');
        });

        test('should close modal when clicking outside', () => {
            showConfirmationModal('Test message', mockCallback);
            // Simulate clicking outside
            const outsideClickHandler = mockModal.addEventListener.mock.calls[0][1];
            outsideClickHandler({ target: mockModal });
            expect(mockModal.style.display).toBe('none');
        });

        test('should not close modal when clicking inside', () => {
            showConfirmationModal('Test message', mockCallback);
            // Simulate clicking inside
            const outsideClickHandler = mockModal.addEventListener.mock.calls[0][1];
            outsideClickHandler({ target: mockConfirmButton });
            expect(mockModal.style.display).toBe('block');
        });
    });
}); 