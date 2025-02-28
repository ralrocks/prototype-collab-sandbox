
import { Flight } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';

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
  
  try {
    // Set up system prompt and user prompt for the API call
    const systemPrompt = `
      You are a flight information assistant that provides accurate and well-structured flight search results.
      Your output should always be valid JSON that can be parsed by JavaScript's JSON.parse().
      Format each flight with at least these fields: id, attribute (airline name), question1 (route info), price, 
      and details (an object with flightNumber, duration, departureTime, arrivalTime, cabin, and stops).
    `;
    
    const userPrompt = `
      Find ${tripType === 'roundtrip' ? 'round-trip' : 'one-way'} flights from ${from} to ${to} for departure on ${departureDate}
      ${returnDate ? `and return on ${returnDate}` : ''}.
      
      Return exactly 5-8 flight options with realistic prices, times, and airline information.
      Format your response as a JSON array of flight objects with these fields:
      - id: a unique number
      - attribute: the airline name
      - question1: a string with route info like "LAX → JFK (8:00 AM - 4:30 PM)"
      - price: a realistic price in USD as a number (no $ symbol)
      - details: an object containing:
        - flightNumber: airline code + number
        - duration: in ISO 8601 duration format (e.g., "PT5H30M")
        - departureTime: ISO timestamp
        - arrivalTime: ISO timestamp
        - cabin: "ECONOMY"
        - stops: number of stops (0 for nonstop)
      
      IMPORTANT: Return ONLY the JSON array with no explanations or other text.
    `;
    
    // Set a timeout to handle long-running API requests
    const timeoutPromise = new Promise<Flight[]>((_, reject) => {
      setTimeout(() => {
        console.log('Search taking too long, using fallback data');
        reject(new Error('API request timeout'));
      }, 4000); // 4 second timeout
    });
    
    // Call the API and process the response
    const apiCallPromise = makeApiCall(systemPrompt, userPrompt, from, to, departureDate);
    
    // Use Promise.race to either get API results or fallback to generated data if timeout occurs
    return Promise.race([apiCallPromise, timeoutPromise])
      .catch(error => {
        console.error('Error fetching flights:', error);
        return generateFallbackFlights(from, to, departureDate);
      });
  } catch (error) {
    console.error('Error in fetchFlights:', error);
    // In case of any error, still return fallback data
    return generateFallbackFlights(from, to, departureDate);
  }
};

/**
 * Make the actual API call and process the response
 */
const makeApiCall = async (
  systemPrompt: string,
  userPrompt: string,
  from: string,
  to: string,
  departureDate: string
): Promise<Flight[]> => {
  try {
    console.log('Making API call to Perplexity');
    
    // Make the request to Perplexity API
    const response = await makePerplexityRequest(systemPrompt, userPrompt);
    console.log('Received response from Perplexity API');
    
    // Extract and validate the JSON from the response
    let flights = extractJsonFromResponse(response);
    
    // Ensure the response is an array
    if (!Array.isArray(flights)) {
      console.error('API did not return an array, using fallback data');
      return generateFallbackFlights(from, to, departureDate);
    }
    
    // Validate and clean the flight data
    flights = flights.map((flight, index) => {
      // Ensure each flight has required fields
      if (!flight.attribute || !flight.question1 || !flight.price) {
        console.warn(`Flight ${index} missing required fields, fixing...`);
      }
      
      // Create a sanitized flight object with defaults for missing data
      return {
        id: flight.id || index + 1,
        attribute: flight.attribute || 'Unknown Airline',
        question1: flight.question1 || `${from} → ${to}`,
        price: typeof flight.price === 'number' ? flight.price : 200 + Math.floor(Math.random() * 300),
        tripType: 'oneway',
        details: {
          flightNumber: flight.details?.flightNumber || `FL${1000 + index}`,
          duration: flight.details?.duration || 'PT3H00M',
          departureTime: flight.details?.departureTime || new Date().toISOString(),
          arrivalTime: flight.details?.arrivalTime || new Date().toISOString(),
          cabin: flight.details?.cabin || 'ECONOMY',
          stops: flight.details?.stops || 0
        }
      };
    });
    
    console.log(`Processed ${flights.length} flights from API`);
    return flights;
  } catch (error) {
    console.error('API call failed:', error);
    throw error; // Rethrow to be caught by the main function
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
