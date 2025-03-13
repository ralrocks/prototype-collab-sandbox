
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
      console.error('Invalid date format:', dateString);
      throw new Error('Invalid date format');
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.error('Error parsing date:', error);
    throw new Error('Invalid date format');
  }
};

/**
 * Function to search for flights using Perplexity AI
 */
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string,
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
    console.error('No Perplexity API key found');
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
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
      "price": 299,
      "departureAirport": "${from}",
      "arrivalAirport": "${to}"
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
      throw new Error('No flight data found for this route. Please try another search.');
    }
    
    // Transform the data to match our Flight type
    return flightData.map((flight: any, index: number) => ({
      id: index + 1,
      attribute: flight.airline || 'Unknown Airline',
      question1: `${from} → ${to} (${new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: typeof flight.price === 'number' ? flight.price : Math.floor(200 + Math.random() * 300),
      tripType: tripType,
      details: {
        flightNumber: flight.flightNumber || `FL${1000 + index}`,
        duration: flight.duration || 'PT3H00M',
        departureTime: flight.departureTime || new Date().toISOString(),
        arrivalTime: flight.arrivalTime || new Date().toISOString(),
        cabin: flight.cabin || 'ECONOMY',
        stops: typeof flight.stops === 'number' ? flight.stops : 0,
        airline: flight.airline,
        departureAirport: from,
        arrivalAirport: to
      }
    }));
  } catch (error) {
    console.error('Error fetching flight data:', error);
    throw error;
  }
};

// Function to format duration in a more readable way
export const formatDuration = (duration: string) => {
  try {
    // Simple PT5H30M format parser
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return 'Duration unavailable';
  }
};
