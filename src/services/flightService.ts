
import { Flight } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { useApiKey } from '@/contexts/ApiKeyContext';

// Get the API key from localStorage as a fallback
const getApiKeyFromStorage = (): string | null => {
  // In a real implementation, we'd use a more secure method
  const DEFAULT_API_KEY = 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  return DEFAULT_API_KEY;
};

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
  
  // Get API key - in a real implementation, we would use a better method to get this
  const apiKey = getApiKeyFromStorage();
  
  if (!apiKey) {
    console.error('No Perplexity API key found, using fallback data');
    return generateFallbackFlights(from, to, departureDate);
  }
  
  try {
    // Create a system prompt for Perplexity to generate flight data
    const systemPrompt = `
      You are a flight search assistant. Provide realistic flight information for the requested route.
      Return ONLY a JSON array of flight objects with the following structure:
      [
        {
          "id": number,
          "attribute": "Airline Name",
          "question1": "Origin → Destination (Departure Time - Arrival Time)",
          "price": number,
          "tripType": "oneway" or "roundtrip",
          "details": {
            "flightNumber": "string",
            "duration": "PTxHxxM", 
            "departureTime": "ISO date string",
            "arrivalTime": "ISO date string",
            "cabin": "ECONOMY" or "BUSINESS" or "FIRST",
            "stops": number
          }
        }
      ]
    `;
    
    // Create a user prompt with the specific flight request
    const userPrompt = `
      Find flights from ${from} to ${to} for ${departureDate}.
      Trip type: ${tripType}${returnDate ? `, Return date: ${returnDate}` : ''}.
      Provide 6-8 realistic flight options with accurate prices, times, and airlines.
    `;
    
    console.log('Making Perplexity API request for flights data');
    const startTime = Date.now();
    
    // Set a timeout promise to handle slow responses
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Perplexity API request timed out'));
      }, 4000); // 4 second timeout
    });
    
    // Make the API request with a timeout
    const responsePromise = makePerplexityRequest(systemPrompt, userPrompt, apiKey);
    const response = await Promise.race([responsePromise, timeoutPromise])
      .catch(error => {
        console.error('Error or timeout in Perplexity request:', error);
        throw error;
      });
    
    if (!response) {
      throw new Error('No response from Perplexity API');
    }
    
    console.log(`Perplexity API responded in ${Date.now() - startTime}ms`);
    
    // Extract JSON from the response
    const flightData = extractJsonFromResponse(response);
    
    if (!Array.isArray(flightData)) {
      console.error('Perplexity returned non-array data:', flightData);
      throw new Error('Invalid data format received from API');
    }
    
    // Validate and normalize the flight data
    const normalizedFlights: Flight[] = flightData.map((flight: any, index: number) => {
      // Ensure the flight has an id
      if (!flight.id) {
        flight.id = index + 1;
      }
      
      // Fix any missing details
      if (!flight.details) {
        flight.details = {
          flightNumber: `${flight.attribute?.substring(0, 2).toUpperCase() || 'FL'}${1000 + index}`,
          duration: 'PT3H00M',
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
          cabin: 'ECONOMY',
          stops: 0
        };
      }
      
      return flight as Flight;
    });
    
    console.log(`Successfully processed ${normalizedFlights.length} flights from Perplexity API`);
    return normalizedFlights;
    
  } catch (error) {
    console.error('Error fetching flights from Perplexity:', error);
    console.log('Falling back to generated flight data');
    
    // Return fallback flights if API call fails
    return generateFallbackFlights(from, to, departureDate);
  }
};

/**
 * Generate fallback flights if API fails
 */
export const generateFallbackFlights = (
  from: string, 
  to: string, 
  departureDate: string,
): Flight[] => {
  console.log('Generating fallback flights data for', from, 'to', to);
  
  // Parse the departure date safely
  let depDate: Date;
  try {
    depDate = new Date(departureDate);
    // Validate date
    if (isNaN(depDate.getTime())) {
      console.log('Invalid departure date format, using current date + 10 days');
      depDate = new Date();
      depDate.setDate(depDate.getDate() + 10);
    }
  } catch (error) {
    console.log('Error parsing departure date:', error);
    depDate = new Date();
    depDate.setDate(depDate.getDate() + 10);
  }
  
  // Default airlines
  const airlines = [
    'Delta Air Lines',
    'American Airlines',
    'United Airlines',
    'Southwest Airlines',
    'JetBlue',
    'Alaska Airlines'
  ];
  
  // Generate basic fallback flights
  const fallbackFlights: Flight[] = [];
  
  for (let i = 0; i < 6; i++) {
    const airline = airlines[i % airlines.length];
    const price = 200 + Math.floor(Math.random() * 300);
    
    const departureTime = new Date(depDate);
    departureTime.setHours(8 + i * 3);
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + 3);
    
    fallbackFlights.push({
      id: i + 1,
      attribute: airline,
      question1: `${from} → ${to} (${departureTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: price,
      tripType: 'oneway',
      details: {
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
        duration: 'PT3H00M',
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        cabin: 'ECONOMY',
        stops: 0
      }
    });
  }
  
  return fallbackFlights;
};
