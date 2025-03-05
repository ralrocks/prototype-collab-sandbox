
import { Hotel } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

// Collection of real hotel chain logos and images
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
  'Embassy Suites': 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Default image for hotels without a matching chain
const defaultHotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

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
  } = {}
): Promise<Hotel[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut} with filters:`, filters);
  
  // Check if API key exists
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found');
    toast.error('API key is required to fetch hotel data');
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
  
  const systemPrompt = 'You are a hotel booking API. Return only valid JSON arrays of hotel data based on the query.';
  const userPrompt = `Find 10 hotels in ${city} for a stay from ${checkIn} to ${checkOut}.
  ${filterDescription ? `Filter requirements: ${filterDescription}` : ''}
  Include major hotel chains such as Marriott, Hilton, Hyatt, InterContinental, Holiday Inn, Sheraton, and other well-known brands.
  Return results as a JSON array with each hotel having: id, name, price (per night in USD), rating (out of 5), amenities (array of strings), and location.
  Example format:
  [
    {
      "id": 1,
      "name": "Grand Plaza Hotel Marriott",
      "price": 199,
      "rating": 4.5,
      "amenities": ["Free WiFi", "Pool", "Spa"],
      "location": "Downtown Chicago"
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
      toast.error('Unable to retrieve hotel data. Please try again later.');
      throw new Error('Invalid hotel data received from API');
    }
    
    // Transform the data with appropriate images and apply filters
    const processedHotels = hotelData.map((hotel: any, index: number) => ({
      id: hotel.id || index + 1,
      name: hotel.name || `Hotel ${index + 1}`,
      price: typeof hotel.price === 'number' ? hotel.price : parseInt(hotel.price) || 150 + Math.floor(Math.random() * 200),
      rating: typeof hotel.rating === 'number' ? hotel.rating : parseFloat(hotel.rating) || 4.0,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : ['Free WiFi', 'Breakfast'],
      image: getHotelImage(hotel.name),
      location: hotel.location || city
    }));
    
    // Apply filters on the processed data
    return filterHotels(processedHotels, filters);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    toast.error('Failed to fetch hotel data. Please try again later.');
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
