// Common currency utilities for the application

// Static currency conversion rates to SGD
export const CURRENCY_CONVERSION_RATES = {
  SGD: 1.00,    // 1 SGD = 1 SGD (base currency)
  USD: 1.35,    // 1 USD = 1.35 SGD
  EUR: 1.45,    // 1 EUR = 1.45 SGD
  GBP: 1.70,    // 1 GBP = 1.70 SGD
  JPY: 0.0088,  // 1 JPY = 0.0088 SGD
  AUD: 0.88,    // 1 AUD = 0.88 SGD
  CAD: 0.99,    // 1 CAD = 0.99 SGD
  CNY: 0.19,    // 1 CNY = 0.19 SGD
  HKD: 0.17,    // 1 HKD = 0.17 SGD
  INR: 0.016    // 1 INR = 0.016 SGD
};

/**
 * Converts a price from the specified currency to SGD
 * @param price - The price to convert
 * @param currency - The currency code (USD, EUR, etc.)
 * @returns The price in SGD
 */
export const convertToSGD = (price: number, currency?: string | null): number => {
  if (!currency) return price * CURRENCY_CONVERSION_RATES.USD; // Default to USD if no currency provided
  
  // Ensure currency is uppercase and handle safely
  const currencyKey = (currency || '').toUpperCase() as keyof typeof CURRENCY_CONVERSION_RATES;
  const conversionRate = CURRENCY_CONVERSION_RATES[currencyKey] || CURRENCY_CONVERSION_RATES.USD;
  
  return price * conversionRate;
};

/**
 * Gets the appropriate currency symbol for a currency code
 * @param currency - The currency code (USD, EUR, etc.)
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currency?: string | null): string => {
  if (!currency) return '$';
  
  switch (currency.toUpperCase()) {
    case 'USD': return 'US$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'SGD': return 'S$';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    case 'HKD': return 'HK$';
    case 'INR': return '₹';
    default: return '$';
  }
};

/**
 * Formats a price in SGD with 2 decimal places
 * @param price - The price to format
 * @returns Formatted price string with 2 decimal places
 */
export const formatSGDPrice = (price: number = 0): string => {
  return price.toFixed(2);
}; 