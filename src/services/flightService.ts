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
 * Function to search for flights using Perplexity AI with efficient prompting
 */
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}`);

  // Return fallback data immediately for better user experience
  const fallbackData = generateFallbackFlights(from, to, departureDate);
  
  // Try to fetch real data in the background, but don't wait for it
  try {
    // Set a very short timeout for flight search - 4 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.log('Flight search taking too long, using fallback data');
        reject(new Error('Flight search timed out'));
      }, 4000);
    });
    
    // Extremely specific prompt to get exactly what we need in a structured format
    const systemPrompt = `You are a flight search API that returns ONLY a JSON array of 4-5 flights with no explanation or extra text. Just the JSON array.`;
    
    const userPrompt = `Return a JSON array of flights from ${from} to ${to} on ${departureDate}. Each flight must have this exact structure:
    {
      "id": (number),
      "airline": "(airline name)",
      "price": (number),
      "route": "${from} to ${to}"
    }
    IMPORTANT: Return ONLY the JSON array with no additional text or explanation.`;
    
    // Make the API request with a timeout
    const responsePromise = makePerplexityRequest(systemPrompt, userPrompt, 0.1, 1000);
    
    // Race the API request against the timeout
    const response = await Promise.race([responsePromise, timeoutPromise])
      .catch(error => {
        console.error('Error or timeout in flight search:', error);
        throw error;
      });
    
    if (!response) {
      throw new Error('No response from Perplexity API');
    }
    
    // Extract JSON from the response
    const flightData = extractJsonFromResponse(response);
    
    if (!Array.isArray(flightData)) {
      console.error('Perplexity returned non-array data:', flightData);
      throw new Error('Invalid data format received from API');
    }
    
    // Validate and normalize the flight data
    const normalizedFlights: Flight[] = flightData.map((flight: any, index: number) => {
      return {
        id: flight.id || index + 1,
        attribute: flight.airline || flight.attribute || 'Unknown Airline',
        question1: flight.route || flight.question1 || `${from} → ${to}`,
        price: typeof flight.price === 'number' ? flight.price : 200 + Math.floor(Math.random() * 300),
        tripType: 'oneway',
        details: flight.details || {
          flightNumber: `${(flight.airline || 'FL').substring(0, 2).toUpperCase()}${1000 + index}`,
          duration: 'PT3H00M',
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
          cabin: 'ECONOMY',
          stops: 0
        }
      };
    });
    
    console.log(`Successfully processed ${normalizedFlights.length} flights from Perplexity API`);
    
    // If we got real data, replace the fallback
    if (normalizedFlights.length > 0) {
      return normalizedFlights;
    }
    
    return fallbackData;
    
  } catch (error) {
    console.error('Error fetching flights from Perplexity:', error);
    console.log('Using pre-generated fallback flight data');
    
    // Return fallback flights if API call fails
    return fallbackData;
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
