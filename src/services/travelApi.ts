
/**
 * Export all travel-related API functions from their respective modules
 */

// Re-export functions from flight service
export { fetchFlights, formatDateForDisplay, generateFallbackFlights } from './flightService';

// Re-export functions from city service
export { searchCities, fallbackCitySearch, getSavedLocations, saveLocation } from './cityService';

// Re-export functions from destination service
export { getDestinationInfo } from './destinationService';

// Re-export functions from hotel service
export { fetchHotels } from './hotelService';

// Re-export functions from car rental service
export { fetchCarRentals } from './carRentalService';

// Re-export functions from package service
export { fetchTravelPackages } from './packageService';

// Create a small debugging helper that can be used throughout the app
export const debugLog = (message: string, data?: any) => {
  console.log(`[Travel API] ${message}`, data || '');
};
