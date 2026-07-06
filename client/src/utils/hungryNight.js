// utils/hungryNight.js

/**
 * Check if current time is within hungry night
 * Sunday to Thursday: 8:30 PM to 10:00 PM
 * Friday and Saturday: 8:30 PM to 10:30 PM
 * @returns {boolean} - True if currently hungry night
 */
export const isHungryNightActive = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const hungryNightStart = 20 * 60 + 30; // 8:30 PM = 20:30
  
  let hungryNightEnd;
  if (day === 5 || day === 6) {
    // Friday or Saturday
    hungryNightEnd = 22 * 60 + 30; // 10:30 PM = 22:30
  } else if (day >= 0 && day <= 4) {
    // Sunday to Thursday
    hungryNightEnd = 22 * 60; // 10:00 PM = 22:00
  } else {
    return false;
  }

  return currentTimeInMinutes >= hungryNightStart && currentTimeInMinutes < hungryNightEnd;
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