
/**
 * Export all travel-related API functions from their respective modules
 */

// Re-export functions from flight service
export { 
  fetchFlights, 
  formatDateForDisplay, 
  formatDuration,
  getFlightDetails
} from './flightService';

// Re-export functions from city service
export { searchCities, fallbackCitySearch, getSavedLocations } from './cityService';

// Re-export functions from destination service
export { getDestinationInfo } from './destinationService';

// Re-export functions from hotel service
export { fetchHotels, getAvailableHotelChains } from './hotelService';
