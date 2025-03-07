import aiohttp
import asyncio
from datetime import datetime, timedelta
import logging

# Default currency conversion rates to SGD (fallback if API fails)
DEFAULT_CONVERSION_RATES = {
    "SGD": 1.00,    # 1 SGD = 1 SGD (base currency)
    "USD": 1.35,    # 1 USD = 1.35 SGD
    "EUR": 1.45,    # 1 EUR = 1.45 SGD
    "GBP": 1.70,    # 1 GBP = 1.70 SGD
    "JPY": 0.0088,  # 1 JPY = 0.0088 SGD
    "AUD": 0.88,    # 1 AUD = 0.88 SGD
    "CAD": 0.99,    # 1 CAD = 0.99 SGD
    "CNY": 0.19,    # 1 CNY = 0.19 SGD
    "HKD": 0.17,    # 1 HKD = 0.17 SGD
    "INR": 0.016,   # 1 INR = 0.016 SGD
    "MYR": 0.30     # 1 MYR = 0.30 SGD
}

# Mutable object to store the currently active conversion rates
CURRENCY_CONVERSION_RATES = DEFAULT_CONVERSION_RATES.copy()

# API endpoint for currency conversion rates
CURRENCY_API_URL = 'https://open.er-api.com/v6/latest/SGD'

# Last update timestamp
last_update = None

# Update interval (24 hours)
UPDATE_INTERVAL = timedelta(hours=24)

logger = logging.getLogger(__name__)

async def fetch_currency_rates():
    """Fetches the latest currency conversion rates from the API"""
    global CURRENCY_CONVERSION_RATES, last_update
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(CURRENCY_API_URL, ssl=False) as response:
                if response.status != 200:
                    raise aiohttp.ClientError(f"API error: {response.status}")
                
                data = await response.json()
                
                # The API returns rates from base currency to others
                # We need to invert them as our system uses rates TO SGD
                rates = {}
                
                # Set SGD base rate
                rates['SGD'] = 1.0
                
                # Convert other currencies
                for currency, rate in data['rates'].items():
                    if currency != 'SGD':
                        # Invert the rate to get X to SGD conversion
                        rates[currency] = 1 / rate
                
                # Update the global conversion rates
                CURRENCY_CONVERSION_RATES.update(rates)
                last_update = datetime.now()
                
                logger.info('Currency rates updated successfully')
    except Exception as e:
        logger.error(f'Failed to fetch currency rates: {str(e)}')
        logger.info('Using default currency rates as fallback')
        # Keep using the default rates if API fails
        CURRENCY_CONVERSION_RATES = DEFAULT_CONVERSION_RATES.copy()

def get_conversion_rate(currency: str) -> float:
    """Gets the conversion rate for a specific currency to SGD"""
    # Ensure currency is uppercase
    currency = currency.upper()
    return CURRENCY_CONVERSION_RATES.get(currency, CURRENCY_CONVERSION_RATES['USD'])

def convert_to_sgd(amount: float, currency: str) -> float:
    """Converts an amount from the specified currency to SGD"""
    rate = get_conversion_rate(currency)
    return amount * rate

async def update_rates_if_needed():
    """Updates the currency rates if the last update was more than UPDATE_INTERVAL ago"""
    global last_update
    
    if last_update is None or datetime.now() - last_update > UPDATE_INTERVAL:
        await fetch_currency_rates()

# Initialize currency rates
def initialize_currency_service():
    """Initializes the currency service by fetching the initial rates"""
    asyncio.create_task(fetch_currency_rates())