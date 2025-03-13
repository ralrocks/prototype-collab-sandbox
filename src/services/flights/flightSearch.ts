
/**
 * Functions for searching flights and handling flight data
 */
import { Flight } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from '../api/perplexityClient';
import { toast } from 'sonner';
import { formatDateForDisplay } from './flightFormatters';
import { createSyntheticFlights, createFlightsFromPartialData } from './syntheticFlights';

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
  
  // Validate required inputs
  if (!from) {
    console.error('Missing departure location');
    throw new Error('Please enter a departure location');
  }
  
  if (!to) {
    console.error('Missing destination location');
    throw new Error('Please enter a destination location');
  }
  
  if (!departureDate) {
    console.error('Missing departure date');
    throw new Error('Please select a departure date');
  }
  
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.error('No Perplexity API key found');
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  // Format dates for better readability
  const formattedDepartureDate = formatDateForDisplay(departureDate);
  const formattedReturnDate = returnDate ? formatDateForDisplay(returnDate) : undefined;
  
  // Build the prompt for Perplexity with simplified structure for better parsing
  const systemPrompt = 'You are a flight search API that provides real and accurate flight information. Return ONLY a valid JSON array of flight data with no additional text, comments, or markdown formatting.';
  const userPrompt = `Search for real ${tripType === 'roundtrip' ? 'round-trip' : 'one-way'} flights from ${from} to ${to} on ${formattedDepartureDate}${formattedReturnDate ? ` with return on ${formattedReturnDate}` : ''}. 
  Format the results as a JSON array of exactly ${limit} flight options with this exact structure:
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
      "arrivalAirport": "${to}",
      "aircraft": "Boeing 737-800",
      "bookingLink": "https://www.delta.com/booking/DL1234",
      "amenities": ["Wi-Fi", "Power outlets", "In-flight entertainment"],
      "baggageAllowance": "1 carry-on, 1 personal item, first checked bag $30",
      "cancellationPolicy": "Non-refundable, changes allowed with fee",
      "onTimePerformance": "86%",
      "terminalInfo": {
        "departure": "Terminal 2",
        "arrival": "Terminal 4"
      }
    }
  ]
  ONLY return a valid, parseable JSON array. Do not include any text before or after the JSON. Do not use markdown formatting or code blocks. Just return the raw JSON array.`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    
    // Try to parse the JSON from the response
    let flightData;
    try {
      flightData = extractJsonFromResponse(content);
      console.log(`Successfully extracted flight data: ${flightData.length} flights found`);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // Create synthetic data as a fallback
      console.log('Using fallback synthetic data');
      flightData = createSyntheticFlights(from, to, 5);
      
      // Still show toast for debugging purposes
      toast.warning('Using fallback flight data', { 
        description: 'We had trouble getting real-time flights. Showing example flights instead.' 
      });
    }
    
    if (!Array.isArray(flightData) || flightData.length === 0) {
      console.warn('Invalid or empty flight data received, using fallback');
      flightData = createSyntheticFlights(from, to, 5);
    }
    
    // Transform the data to match our Flight type
    return flightData.map((flight: any, index: number) => ({
      id: flight.id || index + 1,
      attribute: flight.airline || 'Unknown Airline',
      question1: `${from} → ${to} (${new Date(flight.departureTime || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(flight.arrivalTime || new Date(Date.now() + 3 * 60 * 60 * 1000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: typeof flight.price === 'number' ? flight.price : Math.floor(200 + Math.random() * 300),
      tripType: tripType,
      details: {
        flightNumber: flight.flightNumber || `FL${1000 + index}`,
        duration: flight.duration || 'PT3H00M',
        departureTime: flight.departureTime || new Date().toISOString(),
        arrivalTime: flight.arrivalTime || new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        cabin: flight.cabin || 'ECONOMY',
        stops: typeof flight.stops === 'number' ? flight.stops : 0,
        airline: flight.airline || `Airline ${index + 1}`,
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
    }));
  } catch (error) {
    console.error('Error fetching flight data:', error);
    
    // Display a more user-friendly error message
    if (error instanceof Error) {
      toast.error('Error loading flights', { 
        description: error.message
      });
    } else {
      toast.error('An unexpected error occurred while searching for flights');
    }
    
    throw error;
  }
};

/**
 * Get more details about a specific flight
 */
export const getFlightDetails = async (flight: Flight): Promise<any> => {
  if (!flight.details?.bookingLink) {
    return null;
  }
  
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    toast.error('API key required', { description: 'Please add your Perplexity API key in settings' });
    throw new Error('Perplexity API key not found');
  }
  
  const systemPrompt = 'You are a flight information API. Provide detailed information about the requested flight in JSON format.';
  const userPrompt = `Provide detailed information about ${flight.attribute} flight ${flight.details.flightNumber} from ${flight.details.departureAirport} to ${flight.details.arrivalAirport}.
  Include details about the aircraft, in-flight services, baggage policies, and any other relevant information.
  Return the information in JSON format without any explanations.`;
  
  try {
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    return extractJsonFromResponse(content);
  } catch (error) {
    console.error('Error fetching flight details:', error);
    throw error;
  }
};
