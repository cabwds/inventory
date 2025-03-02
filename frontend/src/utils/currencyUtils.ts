// Common currency utilities for the application

// Default currency conversion rates to SGD (fallback if API fails)
const DEFAULT_CONVERSION_RATES = {
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

// Mutable object to store the currently active conversion rates
export let CURRENCY_CONVERSION_RATES = { ...DEFAULT_CONVERSION_RATES };

// API endpoint for currency conversion rates
const CURRENCY_API_URL = 'https://open.er-api.com/v6/latest/SGD';

/**
 * Fetches the latest currency conversion rates from an external API
 * @returns Promise that resolves when currency rates are updated
 */
export const fetchCurrencyRates = async (): Promise<void> => {
  try {
    const response = await fetch(CURRENCY_API_URL);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns rates from base currency to others
    // We need to invert them as our system uses rates TO SGD
    const rates: Record<string, number> = {};
    
    // Set SGD base rate
    rates.SGD = 1.0;
    
    // Convert other currencies
    Object.entries(data.rates).forEach(([currency, rate]) => {
      if (currency !== 'SGD') {
        // Invert the rate to get X to SGD conversion
        rates[currency] = 1 / (rate as number);
      }
    });
    
    // Update the global conversion rates
    CURRENCY_CONVERSION_RATES = {
      ...DEFAULT_CONVERSION_RATES, // Keep as fallback
      ...rates // Overwrite with new rates
    };
    
    console.log('Currency rates updated successfully');
  } catch (error) {
    console.error('Failed to fetch currency rates:', error);
    console.log('Using default currency rates as fallback');
    // Keep using the default rates if API fails
    CURRENCY_CONVERSION_RATES = { ...DEFAULT_CONVERSION_RATES };
  }
};

/**
 * Initializes the currency service by fetching the latest rates
 * This should be called once during app initialization
 */
export const initializeCurrencyService = (): void => {
  // Fetch rates immediately
  fetchCurrencyRates()
    .catch(error => console.error('Currency service initialization failed:', error));
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