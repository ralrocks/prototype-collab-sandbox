
import { Flight } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

/**
 * Format date for display (Month Day, Year)
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log('Invalid date format, using current date + 10 days');
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + 10);
      return fallbackDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.log('Error parsing date:', error);
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 10);
    return fallbackDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

/**
 * Generate fallback flights when API is unavailable
 */
export const generateFallbackFlights = (
  from: string, 
  to: string, 
  departureDate: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Flight[] => {
  const airlines = [
    'Delta Air Lines', 'American Airlines', 'United Airlines', 'Southwest Airlines',
    'JetBlue Airways', 'Alaska Airlines', 'British Airways', 'Air France', 
    'Lufthansa', 'Emirates'
  ];
  
  const cabins = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
  
  const baseTime = new Date(departureDate);
  baseTime.setHours(6, 0, 0, 0); // Start at 6am
  
  return Array.from({ length: 15 }, (_, index) => {
    // Create departure time (starting from 6am with 1.5-hour intervals)
    const departureTime = new Date(baseTime);
    departureTime.setHours(departureTime.getHours() + index * 1.5);
    
    // Random duration between 2-8 hours
    const durationHours = 2 + Math.floor(Math.random() * 6);
    const durationMinutes = Math.floor(Math.random() * 60);
    
    // Calculate arrival time
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + durationHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
    
    // Generate random price between $199-$899
    const price = 199 + Math.floor(Math.random() * 700);
    
    // Random airline
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    
    // Random cabin class with economy being most common
    const cabinIndex = Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * cabins.length);
    const cabin = cabins[cabinIndex];
    
    // Random number of stops (0-2) with non-stop being most common
    const stopsRandom = Math.random();
    const stops = stopsRandom < 0.6 ? 0 : stopsRandom < 0.9 ? 1 : 2;
    
    // Generate flight number
    const flightNumber = `${airline.substring(0, 2).toUpperCase()}${1000 + Math.floor(Math.random() * 9000)}`;
    
    return {
      id: index + 1,
      attribute: airline,
      question1: `${from} → ${to} (${departureTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: price,
      tripType: tripType,
      details: {
        flightNumber: flightNumber,
        duration: `PT${durationHours}H${durationMinutes}M`,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        cabin: cabin,
        stops: stops
      }
    };
  });
};

/**
 * Function to search for flights using Perplexity AI
 */
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway',
  page: number = 1,
  limit: number = 10
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}${returnDate ? ` with return on ${returnDate}` : ''}`);
  console.log(`Page: ${page}, Limit: ${limit}`);
  
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found, using fallback flight data');
    return generateFallbackFlights(from, to, departureDate, tripType);
  }
  
  // Format dates for better readability
  const formattedDepartureDate = formatDateForDisplay(departureDate);
  const formattedReturnDate = returnDate ? formatDateForDisplay(returnDate) : undefined;
  
  // Build the prompt for Perplexity
  const systemPrompt = 'You are a flight search API. You return ONLY valid JSON arrays of flight information based on the user query. No explanations, just data.';
  const userPrompt = `Search for ${tripType === 'roundtrip' ? 'round-trip' : 'one-way'} flights from ${from} to ${to} on ${formattedDepartureDate}${formattedReturnDate ? ` with return on ${formattedReturnDate}` : ''}. 
  Format the results as a structured JSON array of exactly ${limit} flight options. 
  Each flight should include: airline name, flight number, departure time, arrival time, duration, number of stops (0 for non-stop), cabin class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST), and price in USD.
  Don't include any explanation, just return valid JSON that can be parsed with JSON.parse().
  Format the response exactly like this example:
  [
    {
      "airline": "Delta Air Lines",
      "flightNumber": "DL1234",
      "departureTime": "2023-12-10T08:30:00.000Z",
      "arrivalTime": "2023-12-10T11:45:00.000Z",
      "duration": "PT3H15M",
      "stops": 0,
      "cabin": "ECONOMY",
      "price": 299
    },
    ...${limit-1} more similar objects
  ]`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    
    // Parse the JSON from the response
    const flightData = extractJsonFromResponse(content);
    
    if (!Array.isArray(flightData) || flightData.length === 0) {
      console.error('Invalid flight data received:', flightData);
      toast.error('Unable to retrieve flight data. Using fallback flights.');
      return generateFallbackFlights(from, to, departureDate, tripType);
    }
    
    // Transform the data to match our Flight type
    return flightData.map((flight: any, index: number) => ({
      id: (page - 1) * limit + index + 1,
      attribute: flight.airline || 'Unknown Airline',
      question1: `${from} → ${to} (${new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: flight.price || Math.floor(200 + Math.random() * 300),
      tripType: tripType,
      details: {
        flightNumber: flight.flightNumber || `FL${1000 + index}`,
        duration: flight.duration || 'PT3H00M',
        departureTime: flight.departureTime || new Date().toISOString(),
        arrivalTime: flight.arrivalTime || new Date().toISOString(),
        cabin: flight.cabin || 'ECONOMY',
        stops: flight.stops || 0
      }
    }));
  } catch (error: any) {
    console.error('Error fetching flight data:', error);
    toast.error('Failed to fetch flight data. Using fallback flights.');
    return generateFallbackFlights(from, to, departureDate, tripType);
  }
};
