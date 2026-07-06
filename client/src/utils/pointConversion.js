// pointConversion.js

/**
 * Member Points Conversion Utility
 * Rules:
 * - 100 points = $5 discount
 * - Minimum usage: 100 points
 * - Maximum usage: 500 points per transaction
 */

/**
 * Convert points to dollars
 * @param {number} points - Points to convert
 * @returns {number} Dollar amount
 */
export const convertPointsToDollars = (points) => {
    return points / 20; // 100 points = $5, so 1 point = $0.05
};

/**
 * Convert dollars to points
 * @param {number} dollars - Dollar amount to convert
 * @returns {number} Points value
 */
export const convertDollarsToPoints = (dollars) => {
    return dollars * 20; // $5 = 100 points
};

/**
 * Calculate maximum points user can use based on cart total
 * @param {number} cartTotal - Total price of cart
 * @returns {number} Maximum points allowed
 */
export const getMaxPointsByCartTotal = (cartTotal) => {
    // Each $5 = 100 points
    const maxPoints = Math.floor((cartTotal / 5) * 100);
    return Math.max(0, maxPoints);
};

/**
 * Calculate maximum points user can use (capped at 500 and cart total)
 * @param {number} availablePoints - User's available points
 * @param {number} cartTotal - Total price of cart
 * @returns {number} Maximum usable points
 */
export const getMaxUsablePoints = (availablePoints, cartTotal) => {
    const maxPointsByPrice = getMaxPointsByCartTotal(cartTotal);
    return Math.min(availablePoints, 500, maxPointsByPrice);
};

/**
 * Validate if points can be used
 * @param {number} points - Points to validate
 * @param {number} availablePoints - User's available points
 * @param {number} cartTotal - Total price of cart
 * @returns {object} Validation result { isValid, errorMessage }
 */
export const validatePoints = (points, availablePoints, cartTotal) => {
    // Check if points is a number
    if (isNaN(points) || points === null || points === undefined) {
        return { isValid: false, errorMessage: "Please enter valid points" };
    }

    // Check minimum points
    if (points < 100) {
        return { isValid: false, errorMessage: "Minimum 100 points required to use" };
    }

    // Check maximum points per transaction
    if (points > 500) {
        return { isValid: false, errorMessage: "Maximum 500 points allowed per transaction" };
    }

    // Check if user has enough points
    if (points > availablePoints) {
        return { isValid: false, errorMessage: `You only have ${availablePoints} points available` };
    }

    // Check if points exceed cart total
    const maxPointsByCart = getMaxPointsByCartTotal(cartTotal);
    if (points > maxPointsByCart) {
        const maxDiscount = convertPointsToDollars(maxPointsByCart);
        return { 
            isValid: false, 
            errorMessage: `Points discount cannot exceed cart total. Maximum points you can use: ${maxPointsByCart} points ($${maxDiscount.toFixed(2)} discount)` 
        };
    }

    return { isValid: true, errorMessage: null };
};

/**
 * Calculate discount and new total after applying points
 * @param {number} pointsToUse - Points to apply
 * @param {number} cartTotal - Original cart total
 * @returns {object} { discountAmount, newTotal }
 */
export const calculateDiscount = (pointsToUse, cartTotal) => {
    const discountAmount = convertPointsToDollars(pointsToUse);
    const newTotal = Math.max(0, cartTotal - discountAmount);
    return { discountAmount, newTotal };
};

/**
 * Round points to nearest valid value (multiples of 100)
 * @param {number} points - Points to round
 * @returns {number} Rounded points
 */
export const roundToValidPoints = (points) => {
    if (isNaN(points)) return 0;
    return Math.round(points / 100) * 100;
};

/**
 * Get point usage suggestions based on cart total
 * @param {number} cartTotal - Total price of cart
 * @param {number} availablePoints - User's available points
 * @returns {array} Array of suggested point amounts
 */
export const getPointSuggestions = (cartTotal, availablePoints) => {
    const suggestions = [];
    const maxUsable = getMaxUsablePoints(availablePoints, cartTotal);
    
    // Suggest 100, 200, 300, 400, 500 but not exceeding maxUsable
    [100, 200, 300, 400, 500].forEach(points => {
        if (points <= maxUsable && points <= availablePoints) {
            const discount = convertPointsToDollars(points);
            suggestions.push({ points, discount: discount.toFixed(2) });
        }
    });
    
    return suggestions;
};

/**
 * Format points display
 * @param {number} points - Points to format
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
    return `${points} point${points !== 1 ? 's' : ''}`;
};

/**
 * Check if user can use points at all
 * @param {number} availablePoints - User's available points
 * @param {number} cartTotal - Total price of cart
 * @returns {boolean} True if user can use points
 */
export const canUseAnyPoints = (availablePoints, cartTotal) => {
    if (availablePoints < 100) return false;
    const maxUsable = getMaxUsablePoints(availablePoints, cartTotal);
    return maxUsable >= 100;
};

/**
 * Get points status message
 * @param {number} availablePoints - User's available points
 * @param {number} cartTotal - Total price of cart
 * @returns {string} Status message
 */
export const getPointsStatusMessage = (availablePoints, cartTotal) => {
    if (availablePoints < 100) {
        return `Need ${100 - availablePoints} more points to use member benefits`;
    }
    
    const maxUsable = getMaxUsablePoints(availablePoints, cartTotal);
    if (maxUsable < 100) {
        return "Cart total too low to use points. Add more items to use points.";
    }
    
    if (availablePoints > 500) {
        return `You have ${availablePoints} points available (max 500 per transaction)`;
    }
    
    return `You have ${availablePoints} points available!`;
};