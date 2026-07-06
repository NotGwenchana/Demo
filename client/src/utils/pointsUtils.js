// utils/pointsUtils.js

/**
 * Calculate points earned from an order
 * @param {Array} cart - Array of cart items
 * @param {number} pointsUsed - Number of points used for discount (actual points, e.g., 100)
 * @returns {Object} { pointsEarned, pointsDeducted, pointsBreakdown }
 */
export const calculatePoints = (cart, pointsUsed = 0) => {
  let pointsEarned = 0;
  const pointsBreakdown = [];
  
  // Define points rules
  const pointsRules = {
    // Category-based points
    'Drinks': 10,
    'Party Pack': 25,
    'Chef Special': 20,
    // Default for other categories
    'default': 15
  };
  
  // Special items with size-based points
  const specialSizeItems = {
    'kimchi-side': {
      points: { small: 5, medium: 10, large: 15 }
    },
    'potato-side': {
      points: { small: 5, medium: 10, large: 15 }
    },
    'fishcake': {
      points: 5 // Fixed points for fishcake
    }
  };
  
  cart.forEach(item => {
    let itemPoints = 0;
    let pointsReason = '';
    
    // Check if it's a special item with size
    if (specialSizeItems[item.id]) {
      const specialItem = specialSizeItems[item.id];
      
      if (item.id === 'fishcake') {
        // Fishcake has fixed points
        itemPoints = specialItem.points;
        pointsReason = `${item.name} (Base item)`;
      } else if (item.size && specialItem.points[item.size]) {
        // Kimchi or Potato with size
        itemPoints = specialItem.points[item.size];
        pointsReason = `${item.name} (${item.size} size)`;
      } else {
        // Default points for these items if no size specified
        itemPoints = pointsRules.default;
        pointsReason = `${item.name} (Default)`;
      }
    } else if (item.id === 'party-pack') {
      // Party Pack special case
      itemPoints = pointsRules['Party Pack'];
      pointsReason = 'Party Pack';
    } else if (item.category === 'Drinks') {
      itemPoints = pointsRules.Drinks;
      pointsReason = `${item.category} - ${item.name}`;
    } else if (item.category === 'Chef Special') {
      itemPoints = pointsRules['Chef Special'];
      pointsReason = `${item.category} - ${item.name}`;
    } else {
      // Default points for all other items
      itemPoints = pointsRules.default;
      pointsReason = `${item.category || 'Other'} - ${item.name}`;
    }
    
    // Multiply by quantity
    const quantity = item.quantity || 1;
    const totalPoints = itemPoints * quantity;
    pointsEarned += totalPoints;
    
    pointsBreakdown.push({
      itemName: item.name,
      category: item.category || 'Other',
      size: item.size || null,
      pointsPerItem: itemPoints,
      quantity: quantity,
      totalPoints: totalPoints,
      reason: pointsReason
    });
  });
  
  // ✅ FIX: pointsUsed is already the actual points (e.g., 100, 200, etc.)
  // We don't need to multiply by 20 because pointsUsed is already in points, not dollars
  const pointsToDeduct = pointsUsed; // Use pointsUsed directly
  
  return {
    pointsEarned,
    pointsDeducted: pointsToDeduct, // This is now the actual points deducted
    pointsBreakdown,
    netPointsChange: pointsEarned - pointsToDeduct,
    // Return detailed breakdown for display
    summary: {
      earned: pointsEarned,
      used: pointsToDeduct,
      net: pointsEarned - pointsToDeduct
    }
  };
};

/**
 * Format points for display
 * @param {number} points 
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
  return `${points} points`;
};

/**
 * Get points value in dollars (for display)
 * @param {number} points 
 * @returns {number} Dollar value
 */
export const pointsToDollars = (points) => {
  return points / 20;
};

/**
 * Validate if user has enough points
 * @param {number} currentPoints - User's current points
 * @param {number} pointsToUse - Points user wants to use
 * @returns {Object} { isValid, message }
 */
export const validatePointsUsage = (currentPoints, pointsToUse) => {
  if (pointsToUse <= 0) {
    return { isValid: true, message: 'No points to use' };
  }
  
  if (pointsToUse > currentPoints) {
    return { 
      isValid: false, 
      message: `Insufficient points. You have ${currentPoints} points.` 
    };
  }
  
  // Check if points are in multiples of 100 (for $5 increments)
  if (pointsToUse % 100 !== 0) {
    return { 
      isValid: false, 
      message: 'Points must be in multiples of 100 (each $5 = 100 points)' 
    };
  }
  
  return { isValid: true, message: 'Valid points usage' };
};