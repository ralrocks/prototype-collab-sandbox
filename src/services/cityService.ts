
/**
 * Service for searching cities and airports
 */
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';

interface LocationOption {
  code: string;
  name: string;
}

/**
 * Search for cities or airports matching the query
 */
export const searchCities = async (query: string): Promise<LocationOption[]> => {
  console.log('Searching cities matching:', query);
  
  try {
    // First check if we have API key
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.log('No Perplexity API key found, using fallback data');
      return fallbackCitySearch(query);
    }
    
    // Make a request to the Perplexity API
    const systemPrompt = 'You are a travel API that returns ONLY valid JSON arrays of city and airport information based on the query. No explanations, just data.';
    const userPrompt = `Find airports and cities matching "${query}". Return results as a JSON array of objects, each with "code" (IATA airport code or city code) and "name" (full city/airport name with country).
    Return only major airports and cities. For example:
    [
      {"code": "LAX", "name": "Los Angeles, USA"},
      {"code": "LHR", "name": "London Heathrow, UK"},
      {"code": "NYC", "name": "New York, USA"}
    ]
    Return exactly 5 results. Only valid JSON, no explanations.`;
    
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.1, 1000);
    const results = extractJsonFromResponse(content);
    
    if (Array.isArray(results) && results.length > 0) {
      return results;
    } else {
      console.log('Invalid results format, using fallback data');
      return fallbackCitySearch(query);
    }
  } catch (error) {
    console.error('Error searching cities:', error);
    return fallbackCitySearch(query);
  }
};

/**
 * Fallback city search function when API fails
 */
export const fallbackCitySearch = (query: string): LocationOption[] => {
  // Comprehensive list of major destinations
  const allDestinations: LocationOption[] = [
    { code: 'JFK', name: 'New York (JFK), USA' },
    { code: 'LGA', name: 'New York (LaGuardia), USA' },
    { code: 'EWR', name: 'Newark, USA' },
    { code: 'LAX', name: 'Los Angeles, USA' },
    { code: 'SFO', name: 'San Francisco, USA' },
    { code: 'ORD', name: 'Chicago, USA' },
    { code: 'MIA', name: 'Miami, USA' },
    { code: 'DFW', name: 'Dallas, USA' },
    { code: 'ATL', name: 'Atlanta, USA' },
    { code: 'LAS', name: 'Las Vegas, USA' },
    { code: 'BOS', name: 'Boston, USA' },
    { code: 'SEA', name: 'Seattle, USA' },
    { code: 'DEN', name: 'Denver, USA' },
    { code: 'HNL', name: 'Honolulu, USA' },
    { code: 'ANC', name: 'Anchorage, USA' },
    { code: 'YYZ', name: 'Toronto, Canada' },
    { code: 'YVR', name: 'Vancouver, Canada' },
    { code: 'YUL', name: 'Montreal, Canada' },
    { code: 'LHR', name: 'London, UK' },
    { code: 'CDG', name: 'Paris, France' },
    { code: 'FCO', name: 'Rome, Italy' },
    { code: 'MAD', name: 'Madrid, Spain' },
    { code: 'BCN', name: 'Barcelona, Spain' },
    { code: 'AMS', name: 'Amsterdam, Netherlands' },
    { code: 'FRA', name: 'Frankfurt, Germany' },
    { code: 'MUC', name: 'Munich, Germany' },
    { code: 'ZRH', name: 'Zurich, Switzerland' },
    { code: 'VIE', name: 'Vienna, Austria' },
    { code: 'SVO', name: 'Moscow, Russia' },
    { code: 'DXB', name: 'Dubai, UAE' },
    { code: 'DOH', name: 'Doha, Qatar' },
    { code: 'SIN', name: 'Singapore' },
    { code: 'BKK', name: 'Bangkok, Thailand' },
    { code: 'HKG', name: 'Hong Kong' },
    { code: 'PEK', name: 'Beijing, China' },
    { code: 'PVG', name: 'Shanghai, China' },
    { code: 'HND', name: 'Tokyo, Japan' },
    { code: 'SYD', name: 'Sydney, Australia' },
    { code: 'MEL', name: 'Melbourne, Australia' },
    { code: 'AKL', name: 'Auckland, New Zealand' },
    { code: 'GRU', name: 'São Paulo, Brazil' },
    { code: 'EZE', name: 'Buenos Aires, Argentina' },
    { code: 'MEX', name: 'Mexico City, Mexico' },
    { code: 'JNB', name: 'Johannesburg, South Africa' },
    { code: 'CPT', name: 'Cape Town, South Africa' },
    { code: 'CAI', name: 'Cairo, Egypt' },
    { code: 'NBO', name: 'Nairobi, Kenya' },
    { code: 'DEL', name: 'Delhi, India' },
    { code: 'BOM', name: 'Mumbai, India' }
  ];
  
  if (!query || query.trim() === '') {
    // Return first 10 destinations if no query
    return allDestinations.slice(0, 10);
  }
  
  // Filter destinations based on query
  const lowerQuery = query.toLowerCase();
  const filteredDestinations = allDestinations.filter(dest => 
    dest.name.toLowerCase().includes(lowerQuery) || 
    dest.code.toLowerCase().includes(lowerQuery)
  );
  
  // Return matches, limited to 10 results
  return filteredDestinations.slice(0, 10);
};
