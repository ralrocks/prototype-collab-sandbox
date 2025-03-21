
import { Hotel } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from '../api/perplexityClient';
import { toast } from 'sonner';

// Collection of real hotel chain images
const hotelChainImages: Record<string, string> = {
  'Marriott': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Hilton': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Hyatt': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'InterContinental': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Holiday Inn': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Sheraton': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Westin': 'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Radisson': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Four Seasons': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Ritz-Carlton': 'https://images.unsplash.com/photo-1586611292717-f828b167408c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Best Western': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Wyndham': 'https://images.unsplash.com/photo-1559599238-308793637427?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Choice Hotels': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Accor': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Crowne Plaza': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'DoubleTree': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Hampton': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Embassy Suites': 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Comfort Inn': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Courtyard': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Fairfield Inn': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'SpringHill Suites': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Renaissance Hotels': 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Residence Inn': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Default image for hotels without a matching chain
const defaultHotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

/**
 * Get a list of available hotel chains for filtering
 */
export const getAvailableHotelChains = (): string[] => {
  return Object.keys(hotelChainImages);
};

/**
 * Get appropriate hotel image based on hotel name
 */
const getHotelImage = (hotelName: string): string => {
  // Check if the hotel name contains any of the known chain names
  const matchedChain = Object.keys(hotelChainImages).find(chain => 
    hotelName.toLowerCase().includes(chain.toLowerCase())
  );
  
  return matchedChain ? hotelChainImages[matchedChain] : defaultHotelImage;
};

/**
 * Fetch hotels from the Perplexity API with filters
 */
export const fetchHotels = async (
  city: string, 
  checkIn: string, 
  checkOut: string,
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
    hotelChains?: string[];
    page?: number;
    limit?: number;
  } = {}
): Promise<Hotel[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut} with filters:`, filters);
  
  // Set default pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  
  // Check if API key exists
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.error('No Perplexity API key found');
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  // Build filter description for the prompt
  let filterDescription = '';
  if (filters.minPrice || filters.maxPrice) {
    filterDescription += `Price range: ${filters.minPrice || 0} to ${filters.maxPrice || '∞'} USD per night. `;
  }
  if (filters.minRating) {
    filterDescription += `Minimum rating: ${filters.minRating} out of 5 stars. `;
  }
  if (filters.amenities && filters.amenities.length > 0) {
    filterDescription += `Must include amenities: ${filters.amenities.join(', ')}. `;
  }
  if (filters.hotelChains && filters.hotelChains.length > 0) {
    filterDescription += `Preferred hotel chains: ${filters.hotelChains.join(', ')}. `;
  }
  
  const systemPrompt = 'You are a hotel booking API. Return only valid JSON arrays of hotel data based on the query.';
  const userPrompt = `Find ${limit} hotels in ${city} for a stay from ${checkIn} to ${checkOut}.
  ${filterDescription ? `Filter requirements: ${filterDescription}` : ''}
  Include major hotel chains such as Marriott, Hilton, Hyatt, InterContinental, Holiday Inn, Sheraton, and other well-known brands.
  Return results as a JSON array with each hotel having: id, name, price (per night in USD), rating (out of 5), amenities (array of strings), location, and a brief description. Also include policies with checkin, checkout times and cancellation policy.
  Example format:
  [
    {
      "id": 1,
      "name": "Grand Plaza Hotel Marriott",
      "price": 199,
      "rating": 4.5,
      "amenities": ["Free WiFi", "Pool", "Spa", "Fitness Center", "Restaurant"],
      "location": "Downtown Chicago",
      "description": "Luxury hotel in the heart of downtown with stunning city views.",
      "bookingLink": "https://www.marriott.com/hotels/travel/chiax-chicago-marriott-downtown-magnificent-mile/",
      "policies": {
        "cancellation": "Free cancellation up to 24 hours before check-in",
        "checkIn": "From 3:00 PM",
        "checkOut": "Until 11:00 AM"
      }
    },
    ...
  ]
  Return only the JSON array, no explanations.`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.2, 1500);
    
    // Parse the JSON from the response
    const hotelData = extractJsonFromResponse(content);
    
    if (!Array.isArray(hotelData) || hotelData.length === 0) {
      console.error('Invalid hotel data received:', hotelData);
      throw new Error('No hotel data found for this location and dates. Please try another search.');
    }
    
    // Transform the data with appropriate images
    const processedHotels = hotelData.map((hotel: any, index: number) => {
      // Determine if hotel belongs to a chain
      const hotelName = hotel.name || `Hotel ${index + 1}`;
      const matchedChain = Object.keys(hotelChainImages).find(chain => 
        hotelName.toLowerCase().includes(chain.toLowerCase())
      );
      
      return {
        id: hotel.id || index + 1,
        name: hotelName,
        price: typeof hotel.price === 'number' ? hotel.price : parseInt(hotel.price) || 150 + Math.floor(Math.random() * 200),
        rating: typeof hotel.rating === 'number' ? hotel.rating : parseFloat(hotel.rating) || 4.0,
        amenities: Array.isArray(hotel.amenities) ? hotel.amenities : ['Free WiFi', 'Breakfast'],
        image: getHotelImage(hotelName),
        location: hotel.location || city,
        brand: matchedChain || undefined,
        description: hotel.description || `Comfortable accommodations in ${city}`,
        bookingLink: hotel.bookingLink || null,
        policies: hotel.policies || null
      };
    });
    
    // Apply filters on the processed data
    return filterHotels(processedHotels, filters);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
};

/**
 * Get more details about a specific hotel
 */
export const getHotelDetails = async (hotel: Hotel): Promise<any> => {
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    toast.error('API key required', { description: 'Please add your Perplexity API key in settings' });
    throw new Error('Perplexity API key not found');
  }
  
  const systemPrompt = 'You are a hotel information API. Provide detailed information about the requested hotel in JSON format.';
  const userPrompt = `Provide detailed information about ${hotel.name} located in ${hotel.location}.
  Include details about the amenities, room types, check-in/check-out times, policies, and any other relevant information.
  Return the information in JSON format without any explanations.`;
  
  try {
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    return extractJsonFromResponse(content);
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};

/**
 * Apply filters to hotel results
 */
const filterHotels = (hotels: Hotel[], filters: any): Hotel[] => {
  if (!Array.isArray(hotels)) {
    console.error('Invalid hotel data received:', hotels);
    return [];
  }
  
  return hotels.filter(hotel => {
    // Filter by price range
    if (filters.minPrice && hotel.price < filters.minPrice) return false;
    if (filters.maxPrice && hotel.price > filters.maxPrice) return false;
    
    // Filter by rating
    if (filters.minRating && hotel.rating < filters.minRating) return false;
    
    // Filter by hotel chains
    if (filters.hotelChains && filters.hotelChains.length > 0 && hotel.brand) {
      if (!filters.hotelChains.includes(hotel.brand)) return false;
    }
    
    // Filter by amenities
    if (filters.amenities && filters.amenities.length > 0) {
      return filters.amenities.every((amenity: string) => 
        hotel.amenities.some(hotelAmenity => 
          hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
    }
    
    return true;
  });
};
