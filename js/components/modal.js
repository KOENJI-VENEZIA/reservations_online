// Current confirmation callback
let currentConfirmCallback = null;

// Initialize modal functionality
function initializeModal() {
    // Get modal elements
    const confirmModal = document.getElementById('confirmModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    
    // Close modal when clicking X button
    modalClose.addEventListener('click', function() {
        confirmModal.style.display = 'none';
    });
    
    // Close modal when clicking Cancel button
    modalCancel.addEventListener('click', function() {
        confirmModal.style.display = 'none';
    });
    
    // Confirm action when clicking Confirm button
    modalConfirm.addEventListener('click', function() {
        if (typeof currentConfirmCallback === 'function') {
            currentConfirmCallback();
        }
        confirmModal.style.display = 'none';
        currentConfirmCallback = null;
    });
    
    // Close modal when clicking outside
    confirmModal.addEventListener('click', function(event) {
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
}

// Show confirmation modal
function showConfirmationModal(message, callback) {
    const confirmModal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.textContent = message;
    currentConfirmCallback = callback;
    confirmModal.style.display = 'block';
}

// Make functions available globally
window.initializeModal = initializeModal;
window.showConfirmationModal = showConfirmationModal;

// Export functions for testing
module.exports = {
    initializeModal,
    showConfirmationModal
};
