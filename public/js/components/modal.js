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
    
    // Make the showConfirmationModal function globally available
    window.showConfirmationModal = showConfirmationModal;
}

// Show confirmation modal
function showConfirmationModal(message, confirmCallback) {
    const confirmModal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.textContent = message;
    confirmModal.style.display = 'flex';
    currentConfirmCallback = confirmCallback;
}
