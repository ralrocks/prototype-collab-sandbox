
/**
 * Export all flight-related functions from their respective modules
 */
export { fetchFlights, getFlightDetails } from './flightSearch';
export { formatDateForDisplay, formatDuration } from './flightFormatters';
export { createSyntheticFlights } from './syntheticFlights';
// Remove the invalid import of getHotelDetails
