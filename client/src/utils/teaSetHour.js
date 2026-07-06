// utils/teaSetHour.js

/**
 * Check if current time is within tea set hour
 * Everyday: 2:30 PM to 5:30 PM
 * @returns {boolean} - True if currently tea set hour
 */
export const isTeaSetHourActive = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const teaSetHourStart = 14 * 60 + 30; // 2:30 PM = 14:30
  const teaSetHourEnd = 17 * 60 + 30; // 5:30 PM = 17:30

  return currentTimeInMinutes >= teaSetHourStart && currentTimeInMinutes < teaSetHourEnd;
};

/**
 * Get the tea set hour end time
 * @returns {string} - Formatted end time string
 */
export const getTeaSetHourEndTime = () => {
  return "5:30 PM";
};

/**
 * Get the tea set hour start time
 * @returns {string} - Formatted start time string
 */
export const getTeaSetHourStartTime = () => {
  return "2:30 PM";
};

/**
 * Check if an item should be excluded from tea set hour discount
 * @param {string} itemId - The ID of the item
 * @param {string} size - The size of the item (for items with sizes)
 * @returns {boolean} - True if the item should be excluded
 */
export const isExcludedFromTeaSetDiscount = (itemId, size = null) => {
  const excludedItems = ['kimchi-side', 'fishcake', 'potato-side'];
  
  // Check if item is in excluded list
  if (!excludedItems.includes(itemId)) {
    return false;
  }
  
  // For kimchi-side and potato-side, only exclude small size
  if ((itemId === 'kimchi-side' || itemId === 'potato-side') && size === 'small') {
    return true;
  }
  
  // Fishcake is always excluded regardless of size
  if (itemId === 'fishcake') {
    return true;
  }
  
  return false;
};

/**
 * Get the tea set hour price for an item
 * Drinks: $5 flat price
 * Other items: $10 off (except excluded items)
 * @param {number} originalPrice - The original price
 * @param {string} itemId - The ID of the item
 * @param {string} category - The category of the item
 * @param {string} size - The size of the item (for items with sizes)
 * @param {boolean} teaSetHourStatus - Whether tea set hour is currently active
 * @returns {number} - The tea set hour price or original price
 */
export const getTeaSetHourPrice = (originalPrice, itemId, category, teaSetHourStatus, size = null) => {
  if (!teaSetHourStatus) {
    return originalPrice;
  }

  // Check if item should be excluded from discount
  if (isExcludedFromTeaSetDiscount(itemId, size)) {
    return originalPrice;
  }

  // Drinks - flat $5 price
  if (category === 'Drinks') {
    return 5;
  }

  // Other items - $10 off (but not below $0)
  const discountedPrice = originalPrice - 10;
  return Math.max(0, discountedPrice);
};

/**
 * Get tea set hour status and related information
 * @returns {Object} - Contains tea set hour status, end time, and discount information
 */
export const getTeaSetHourInfo = () => {
  const isActive = isTeaSetHourActive();
  
  return {
    isActive,
    startTime: getTeaSetHourStartTime(),
    endTime: getTeaSetHourEndTime(),
    drinkPrice: 5,
    discountAmount: 10,
    excludedItems: ['Kimchi (Small)', 'Fishcake', 'Potato (Small)']
  };
};