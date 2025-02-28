
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';

/**
 * City search function using Perplexity
 */
export const searchCities = async (query: string): Promise<{code: string, name: string}[]> => {
  console.log(`Searching cities matching: ${query}`);
  
  if (!query || query.length < 2) return [];
  
  try {
    const systemPrompt = 'You are an airport database API. Return only valid JSON arrays of airport/city data.';
    const userPrompt = `Search for major cities and their airport codes that match "${query}". 
    Return results as a JSON array with exactly 5 cities that best match the query.
    Each result should have 'code' (airport code) and 'name' (city name).
    Format: [{"code": "JFK", "name": "New York"}, ...]. 
    Just return the JSON array, no explanations.`;
    
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.1, 1000);
    
    // Parse the JSON from the response
    return extractJsonFromResponse(content);
  } catch (error) {
    console.error('Error searching cities:', error);
    return fallbackCitySearch(query);
  }
};

/**
 * Fallback city search with common cities
 */
export const fallbackCitySearch = (query: string): {code: string, name: string}[] => {
  const cities = [
    { code: 'JFK', name: 'New York' },
    { code: 'LAX', name: 'Los Angeles' },
    { code: 'ORD', name: 'Chicago' },
    { code: 'MIA', name: 'Miami' },
    { code: 'SFO', name: 'San Francisco' },
    { code: 'ATL', name: 'Atlanta' },
    { code: 'LAS', name: 'Las Vegas' },
    { code: 'SEA', name: 'Seattle' },
    { code: 'BOS', name: 'Boston' },
    { code: 'DFW', name: 'Dallas' },
    { code: 'DEN', name: 'Denver' },
    { code: 'LHR', name: 'London' },
    { code: 'CDG', name: 'Paris' },
    { code: 'FRA', name: 'Frankfurt' },
    { code: 'AMS', name: 'Amsterdam' }
  ];
  
  return cities
    .filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) || 
      city.code.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);
};
