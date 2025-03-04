// Reservation service functions

// Create a new reservation
function createReservation(reservationData) {
    return new Promise((resolve, reject) => {
        // Generate unique ID
        const reservationId = generateUUID();
        
        // Add timestamps
        const nowSeconds = Date.now() / 1000;
        
        // Create reservation object
        const reservation = {
            id: reservationId,
            ...reservationData,
            creationDate: nowSeconds,
            lastEditedOn: nowSeconds,
            source: "web"
        };
        
        // Write to Firestore
        db.collection(getCollectionName()).doc(reservationId)
            .set(reservation)
            .then(() => {
                resolve({ id: reservationId, ...reservation });
            })
            .catch((error) => {
                console.error("Error creating reservation:", error);
                reject(error);
            });
    });
}

// Get reservations for a specific date
function getReservationsByDate(date) {
    return new Promise((resolve, reject) => {
        db.collection(getCollectionName())
            .where("dateString", "==", date)
            .get()
            .then((querySnapshot) => {
                const reservations = [];
                querySnapshot.forEach((doc) => {
                    reservations.push(doc.data());
                });
                resolve(reservations);
            })
            .catch((error) => {
                console.error("Error getting reservations:", error);
                reject(error);
            });
    });
}

// Get all upcoming reservations
function getUpcomingReservations() {
    const today = new Date().toISOString().split('T')[0];
    
    return new Promise((resolve, reject) => {
        db.collection(getCollectionName())
            .where("dateString", ">=", today)
            .orderBy("dateString")
            .get()
            .then((querySnapshot) => {
                const reservations = [];
                querySnapshot.forEach((doc) => {
                    reservations.push(doc.data());
                });
                resolve(reservations);
            })
            .catch((error) => {
                console.error("Error getting upcoming reservations:", error);
                reject(error);
            });
    });
}

// Get reservations for a specific customer by email
function getReservationsByEmail(email) {
    return new Promise((resolve, reject) => {
        db.collection(getCollectionName())
            .where("email", "==", email)
            .orderBy("creationDate", "desc")
            .get()
            .then((querySnapshot) => {
                const reservations = [];
                querySnapshot.forEach((doc) => {
                    reservations.push(doc.data());
                });
                resolve(reservations);
            })
            .catch((error) => {
                console.error("Error getting customer reservations:", error);
                reject(error);
            });
    });
}

// Update reservation status
function updateReservationStatus(reservationId, status) {
    return new Promise((resolve, reject) => {
        const nowSeconds = Date.now() / 1000;
        
        db.collection(getCollectionName()).doc(reservationId)
            .update({
                status: status,
                lastEditedOn: nowSeconds
            })
            .then(() => {
                resolve({ id: reservationId, status });
            })
            .catch((error) => {
                console.error("Error updating reservation status:", error);
                reject(error);
            });
    });
}

// Cancel a reservation
function cancelReservation(reservationId, reason) {
    return updateReservationStatus(reservationId, "cancelled")
        .then(() => {
            return db.collection(getCollectionName()).doc(reservationId)
                .update({
                    cancellationReason: reason || "Cancelled by customer"
                });
        });
}

// Update reservation details
function updateReservation(reservationId, updates) {
    return new Promise((resolve, reject) => {
        const nowSeconds = Date.now() / 1000;
        updates.lastEditedOn = nowSeconds;
        
        db.collection(getCollectionName()).doc(reservationId)
            .update(updates)
            .then(() => {
                resolve({ id: reservationId, ...updates });
            })
            .catch((error) => {
                console.error("Error updating reservation:", error);
                reject(error);
            });
    });
}

module.exports = {
    createReservation,
    getReservationsByDate,
    getUpcomingReservations,
    getReservationsByEmail,
    updateReservationStatus,
    cancelReservation,
    updateReservation
};