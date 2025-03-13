
/**
 * Generate synthetic flight data when API calls fail
 */
import { Flight } from '@/types';

/**
 * Create synthetic flight data when API fails
 */
export const createSyntheticFlights = (from: string, to: string, count: number = 5): any[] => {
  console.log(`Creating ${count} synthetic flights from ${from} to ${to}`);
  
  const airlines = [
    'Delta Air Lines', 
    'American Airlines', 
    'United Airlines', 
    'Southwest Airlines',
    'JetBlue Airways'
  ];
  
  const aircrafts = [
    'Boeing 737-800',
    'Airbus A320',
    'Boeing 787 Dreamliner',
    'Airbus A321neo',
    'Embraer E190'
  ];
  
  const flights = [];
  const baseTime = new Date();
  
  for (let i = 0; i < count; i++) {
    const airline = airlines[i % airlines.length];
    const airlineCode = airline.split(' ')[0].substring(0, 2).toUpperCase();
    const flightNumber = `${airlineCode}${1000 + Math.floor(Math.random() * 1000)}`;
    
    const departureHours = 7 + Math.floor(Math.random() * 10); // 7 AM to 5 PM
    const departureTime = new Date(baseTime);
    departureTime.setHours(departureHours, Math.floor(Math.random() * 60));
    
    const flightDurationHours = 2 + Math.floor(Math.random() * 4); // 2-5 hours
    const flightDurationMinutes = Math.floor(Math.random() * 60);
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + flightDurationHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDurationMinutes);
    
    const price = 150 + Math.floor(Math.random() * 350); // $150-$500
    
    flights.push({
      airline: airline,
      flightNumber: flightNumber,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: `PT${flightDurationHours}H${flightDurationMinutes}M`,
      stops: Math.random() > 0.7 ? 1 : 0, // 30% chance of 1 stop
      cabin: Math.random() > 0.8 ? 'BUSINESS' : 'ECONOMY', // 20% chance of business class
      price: price,
      departureAirport: from,
      arrivalAirport: to,
      aircraft: aircrafts[i % aircrafts.length],
      bookingLink: `https://www.google.com/flights?q=${from}+to+${to}`,
      amenities: ['Wi-Fi', 'Power outlets', 'In-flight entertainment'],
      baggageAllowance: '1 carry-on, 1 personal item, first checked bag $30',
      cancellationPolicy: 'Non-refundable, changes allowed with fee',
      onTimePerformance: `${80 + Math.floor(Math.random() * 15)}%`,
      terminalInfo: {
        departure: `Terminal ${1 + (i % 3)}`,
        arrival: `Terminal ${1 + (i % 4)}`
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
