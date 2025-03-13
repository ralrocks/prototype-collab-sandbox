import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

interface CityOption {
  code: string;
  name: string;
}

const SAVED_LOCATIONS_KEY = 'savedLocations';

/**
 * Get saved locations from localStorage
 */
export const getSavedLocations = (): CityOption[] => {
  try {
    const savedLocations = localStorage.getItem(SAVED_LOCATIONS_KEY);
    return savedLocations ? JSON.parse(savedLocations) : [];
  } catch (error) {
    console.error('Error getting saved locations:', error);
    return [];
  }
};

/**
 * Save a location to localStorage
 */
export const saveLocation = (location: CityOption): void => {
  try {
    const savedLocations = getSavedLocations();
    
    // Check if location already exists
    const existingIndex = savedLocations.findIndex(loc => loc.code === location.code);
    
    // If it exists, remove it (to move it to the top)
    if (existingIndex !== -1) {
      savedLocations.splice(existingIndex, 1);
    }
    
    // Add location to the beginning of the array
    savedLocations.unshift(location);
    
    // Keep only the last 10 locations
    const updatedLocations = savedLocations.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedLocations));
    console.log('Location saved to localStorage:', location);
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

/**
 * Fallback city search when API is unavailable
 */
export const fallbackCitySearch = (query: string): CityOption[] => {
  const cities = [
    { name: 'New York', code: 'NYC' },
    { name: 'Los Angeles', code: 'LAX' },
    { name: 'Chicago', code: 'ORD' },
    { name: 'San Francisco', code: 'SFO' },
    { name: 'Miami', code: 'MIA' },
    { name: 'Boston', code: 'BOS' },
    { name: 'London', code: 'LHR' },
    { name: 'Paris', code: 'CDG' },
    { name: 'Tokyo', code: 'HND' },
    { name: 'Dubai', code: 'DXB' },
    { name: 'Sydney', code: 'SYD' },
    { name: 'Hong Kong', code: 'HKG' },
    { name: 'Singapore', code: 'SIN' },
    { name: 'Amsterdam', code: 'AMS' },
    { name: 'Beijing', code: 'PEK' },
    { name: 'Denver', code: 'DEN' },
    { name: 'Las Vegas', code: 'LAS' },
    { name: 'Frankfurt', code: 'FRA' },
    { name: 'Berlin', code: 'BER' },
    { name: 'Toronto', code: 'YYZ' },
    { name: 'Seattle', code: 'SEA' },
    { name: 'Barcelona', code: 'BCN' },
    { name: 'Rome', code: 'FCO' },
    { name: 'Madrid', code: 'MAD' },
    { name: 'Cancun', code: 'CUN' },
    { name: 'Atlanta', code: 'ATL' },
    { name: 'Bangkok', code: 'BKK' },
    { name: 'Austin', code: 'AUS' },
    { name: 'Dallas', code: 'DFW' },
    { name: 'Houston', code: 'IAH' },
  ];
  
  return cities.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase()) || 
    city.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
};

/**
 * Search for cities/airports using Perplexity API
 */
export const searchCities = async (query: string): Promise<CityOption[]> => {
  console.log('Searching cities with query:', query);
  
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found, using fallback city search');
    return fallbackCitySearch(query);
  }
  
  try {
    // Build the prompts for Perplexity
    const systemPrompt = 'You are a city and airport search API. Return ONLY valid JSON arrays of city information based on the search query. No explanations, just data.';
    const userPrompt = `Search for cities and airports matching "${query}". 
    Format the results as a structured JSON array of up to 10 cities.
    Each city should include name and airport code.
    Don't include any explanation, just return a valid JSON array that can be parsed with JSON.parse().
    Format like this example:
    [
      {
        "name": "New York",
        "code": "NYC"
      },
      ...more similar objects
    ]`;
    
    console.log('Making Perplexity request for city search');
    
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    
    // Parse the JSON from the response
    const citiesData = extractJsonFromResponse(content);
    
    if (!Array.isArray(citiesData) || citiesData.length === 0) {
      console.error('Invalid cities data received:', citiesData);
      return fallbackCitySearch(query);
    }
    
    console.log('City search results:', citiesData);
    
    // Transform the data if needed
    const results = citiesData.map((city: any) => ({
      name: city.name || 'Unknown City',
      code: city.code || 'XXX'
    }));
    
    return results;
  } catch (error) {
    console.error('Error searching cities:', error);
    return fallbackCitySearch(query);
  }
};
