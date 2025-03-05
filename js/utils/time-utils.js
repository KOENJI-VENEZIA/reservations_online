// Time utility functions

/**
 * Calculate end time from start time
 * @param {string} startTime - Start time in format "HH:MM"
 * @param {string} category - Meal category (lunch or dinner)
 * @returns {string} End time in format "HH:MM"
 */
export function calculateEndTime(startTime, category) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 1;
    let endMinute = category === 'lunch' ? startMinute + 20 : startMinute + 45;
    
    if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
    }
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
} 