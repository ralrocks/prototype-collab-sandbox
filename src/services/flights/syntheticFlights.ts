
/**
 * Generate synthetic flight data when API calls fail
 */
import { Flight } from '@/types';

/**
 * Create synthetic flight data when API fails
 */
export const createSyntheticFlights = (from: string, to: string, count: number = 5, page: number = 1): any[] => {
  console.log(`Creating ${count} synthetic flights from ${from} to ${to} for page ${page}`);
  
  const airlines = [
    'Delta Air Lines', 
    'American Airlines', 
    'United Airlines', 
    'Southwest Airlines',
    'JetBlue Airways',
    'Alaska Airlines',
    'Spirit Airlines',
    'Frontier Airlines',
    'Hawaiian Airlines',
    'Allegiant Air'
  ];
  
  const aircrafts = [
    'Boeing 737-800',
    'Airbus A320',
    'Boeing 787 Dreamliner',
    'Airbus A321neo',
    'Embraer E190',
    'Boeing 777-300ER',
    'Airbus A350-900',
    'Bombardier CRJ-900',
    'Airbus A330-300',
    'Boeing 757-200'
  ];
  
  const flights = [];
  const baseTime = new Date();
  
  // Offset for generating different flights per page
  const pageOffset = (page - 1) * count;
  
  for (let i = 0; i < count; i++) {
    const flightIndex = pageOffset + i;
    const airline = airlines[flightIndex % airlines.length];
    const airlineCode = airline.split(' ')[0].substring(0, 2).toUpperCase();
    const flightNumber = `${airlineCode}${1000 + flightIndex}`;
    
    // Generate different departure times based on page/index
    const departureHours = (6 + Math.floor(flightIndex / airlines.length) * 2) % 24;
    const departureTime = new Date(baseTime);
    departureTime.setHours(departureHours, (flightIndex * 7) % 60);
    
    const flightDurationHours = 2 + (flightIndex % 5);
    const flightDurationMinutes = (flightIndex * 11) % 60;
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + flightDurationHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDurationMinutes);
    
    // Generate different prices based on page/index
    const price = 150 + (flightIndex * 17) % 350;
    
    flights.push({
      airline: airline,
      flightNumber: flightNumber,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: `PT${flightDurationHours}H${flightDurationMinutes}M`,
      stops: flightIndex % 3 === 0 ? 1 : 0, // Every third flight has a stop
      cabin: flightIndex % 5 === 0 ? 'BUSINESS' : 'ECONOMY', // Every fifth flight is business class
      price: price,
      departureAirport: from,
      arrivalAirport: to,
      aircraft: aircrafts[flightIndex % aircrafts.length],
      bookingLink: `https://www.google.com/flights?q=${from}+to+${to}`,
      amenities: ['Wi-Fi', 'Power outlets', 'In-flight entertainment'],
      baggageAllowance: '1 carry-on, 1 personal item, first checked bag $30',
      cancellationPolicy: 'Non-refundable, changes allowed with fee',
      onTimePerformance: `${80 + (flightIndex * 3) % 15}%`,
      terminalInfo: {
        departure: `Terminal ${1 + (flightIndex % 5)}`,
        arrival: `Terminal ${1 + (flightIndex % 6)}`
      }
    });
  }
  
  return flights;
};

/**
 * Create flight data from partial API response
 */
export const createFlightsFromPartialData = (partialData: any, from: string, to: string, tripType: 'oneway' | 'roundtrip'): Flight[] => {
  // Try to extract any useful information from the partial data
  const flights: Flight[] = [];
  
  try {
    // If we have at least one complete flight object
    if (partialData.airline || (Array.isArray(partialData) && partialData[0] && partialData[0].airline)) {
      const flight = Array.isArray(partialData) ? partialData[0] : partialData;
      
      flights.push({
        id: 1,
        attribute: flight.airline || 'Major Airline',
        question1: `${from} → ${to} (${new Date(flight.departureTime || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(flight.arrivalTime || new Date(Date.now() + 3 * 60 * 60 * 1000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
        price: typeof flight.price === 'number' ? flight.price : Math.floor(200 + Math.random() * 300),
        tripType: tripType,
        details: {
          flightNumber: flight.flightNumber || 'FL1001',
          duration: flight.duration || 'PT3H00M',
          departureTime: flight.departureTime || new Date().toISOString(),
          arrivalTime: flight.arrivalTime || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          cabin: flight.cabin || 'ECONOMY',
          stops: typeof flight.stops === 'number' ? flight.stops : 0,
          airline: flight.airline || 'Major Airline',
          departureAirport: from,
          arrivalAirport: to,
          aircraft: flight.aircraft || 'Boeing 737',
          bookingLink: flight.bookingLink || `https://www.google.com/flights?q=${from}+to+${to}`,
          amenities: flight.amenities || ['Wi-Fi', 'Power outlets'],
          baggageAllowance: flight.baggageAllowance || '1 carry-on, 1 personal item',
          cancellationPolicy: flight.cancellationPolicy || 'Non-refundable, changes allowed with fee',
          onTimePerformance: flight.onTimePerformance || '85%',
          terminalInfo: flight.terminalInfo || {
            departure: 'Main Terminal',
            arrival: 'Main Terminal'
          }
        }
      });
    }
    
    return flights;
  } catch (error) {
    console.error('Error creating flights from partial data:', error);
    return [];
  }
};
