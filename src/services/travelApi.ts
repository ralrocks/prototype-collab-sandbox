
/**
 * This file re-exports all travel-related service functions for easier import
 */

// Re-export flight services
export { 
  fetchFlights, 
  getFlightDetails,
  formatDateForDisplay, 
  formatDuration 
} from './flights';

// Re-export hotel services
export { 
  fetchHotels,
  getHotelDetails 
} from './hotels/hotelService';

// Re-export city services
export { 
  searchCities, 
  getCityDetails, 
  getPopularDestinations 
} from './cityService';

// Re-export destination services
export { 
  getDestinations, 
  getDestinationDetails 
} from './destinationService';
