// utils/hungryNightTest.js - TEST VERSION
// This version forces Hungry Night to always be active for testing

/**
 * Check if current time is within hungry night
 * FOR TESTING: Always returns true
 * @returns {boolean} - True if currently hungry night
 */
export const isHungryNightActive = () => {
  // FOR TESTING - Force Hungry Night to always be active
  return true;
};

/**
 * Get the discounted price (30% off) if hungry night is active
 * @param {number} price - The original price
 * @param {boolean} hungryNightStatus - Whether hungry night is currently active
 * @returns {number} - The discounted price or original price
 */
export const getDiscountedPrice = (price, hungryNightStatus) => {
  if (hungryNightStatus) {
    return Math.round(price * 0.7); // 30% off, rounded to nearest whole number
  }
  return price;
};

/**
 * Get the hungry night end time based on the current day
 * @param {number} day - The day of the week (0 = Sunday, 6 = Saturday)
 * @returns {string} - Formatted end time string
 */
export const getHungryNightEndTime = (day) => {
  if (day === 5 || day === 6) {
    return "10:30 PM";
  }
  return "10:00 PM";
};

/**
 * Get the hungry night discount percentage
 * @returns {number} - The discount percentage (30)
 */
export const getDiscountPercentage = () => {
  return 30;
};

/**
 * Get hungry night status and related information
 * @returns {Object} - Contains hungry night status, end time, and discount percentage
 */
export const getHungryNightInfo = () => {
  const now = new Date();
  const isActive = isHungryNightActive();
  const endTime = getHungryNightEndTime(now.getDay());
  const discountPercentage = getDiscountPercentage();
  
  return {
    isActive,
    endTime,
    discountPercentage,
    startTime: "8:30 PM",
    days: {
      weekdays: "Sunday - Thursday",
      weekends: "Friday - Saturday"
    }
  };
};