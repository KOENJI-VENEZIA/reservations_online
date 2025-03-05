// Modal functionality
let currentConfirmCallback = null;

// Initialize modal functionality
export function initializeModal() {
    const confirmModal = document.getElementById('confirmModal');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalClose = document.querySelector('#confirmModal .modal-close');
    
    if (!confirmModal) {
        console.error('Modal container not found');
        return;
    }
    
    // Close modal when clicking the close button
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking the cancel button
    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
    
    // Execute callback when clicking the confirm button
    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            confirmModal.style.display = 'none';
            if (typeof currentConfirmCallback === 'function') {
                currentConfirmCallback();
            }
        });
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
}

// Show confirmation modal with custom message and callback
export function showConfirmationModal(message, callback) {
    const confirmModal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('modalMessage');
    
    if (!confirmModal || !modalMessage) {
        console.error('Modal elements not found');
        return;
    }
    
    modalMessage.textContent = message;
    currentConfirmCallback = callback;
    confirmModal.style.display = 'block';
}

// Make functions available globally
window.initializeModal = initializeModal;
window.showConfirmationModal = showConfirmationModal;
