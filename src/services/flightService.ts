
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
 * Function to search for flights using Perplexity AI
 */
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}${returnDate ? ` with return on ${returnDate}` : ''}`);
  
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found');
    toast.error('API key is required to fetch flight data');
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  // Format dates for better readability
  const formattedDepartureDate = formatDateForDisplay(departureDate);
  const formattedReturnDate = returnDate ? formatDateForDisplay(returnDate) : undefined;
  
  // Build the prompt for Perplexity
  const systemPrompt = 'You are a flight search API. You return ONLY valid JSON arrays of flight information based on the user query. No explanations, just data.';
  const userPrompt = `Search for ${tripType === 'roundtrip' ? 'round-trip' : 'one-way'} flights from ${from} to ${to} on ${formattedDepartureDate}${formattedReturnDate ? ` with return on ${formattedReturnDate}` : ''}. 
  Format the results as a structured JSON array of exactly 8 flight options. 
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
    ...7 more similar objects
  ]`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    
    // Parse the JSON from the response
    const flightData = extractJsonFromResponse(content);
    
    if (!Array.isArray(flightData) || flightData.length === 0) {
      console.error('Invalid flight data received:', flightData);
      toast.error('Unable to retrieve flight data. Please try again later.');
      throw new Error('Invalid flight data received from API');
    }
    
    // Transform the data to match our Flight type
    return flightData.map((flight: any, index: number) => ({
      id: index + 1,
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
  } catch (error) {
    console.error('Error fetching flight data:', error);
    toast.error('Failed to fetch flight data. Please try again later.');
    throw error;
  }
};
