
import { Hotel } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';

/**
 * Fetch hotels from the API with filters
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
  
  try {
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
    const userPrompt = `Find 8 hotels in ${city} for a stay from ${checkIn} to ${checkOut}.
    ${filterDescription ? `Filter requirements: ${filterDescription}` : ''}
    Return results as a JSON array with each hotel having: id, name, price (per night in USD), rating (out of 5), amenities (array of strings), and location.
    Also include an image field with a placeholder URL for each.
    Example format:
    [
      {
        "id": 1,
        "name": "Grand Plaza Hotel",
        "price": 199,
        "rating": 4.5,
        "amenities": ["Free WiFi", "Pool", "Spa"],
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "location": "Downtown Chicago"
      },
      ...
    ]
    Return only the JSON array, no explanations.`;
    
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.2, 1500);
    
    // Parse the JSON from the response
    const hotelData = extractJsonFromResponse(content);
    
    // Apply filters on the API response in case the API didn't filter properly
    return filterHotels(hotelData, filters);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return fallbackHotels(city, filters);
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

/**
 * Fallback hotels if API fails
 */
export const fallbackHotels = (
  city: string,
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    amenities?: string[];
  } = {}
): Hotel[] => {
  const hotels: Hotel[] = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      price: 199,
      rating: 4.5,
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 2,
      name: "Luxury Suites Downtown",
      price: 299,
      rating: 4.8,
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"],
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 3,
      name: "Budget Inn Express",
      price: 99,
      rating: 3.7,
      amenities: ["Free WiFi", "Continental Breakfast"],
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 4,
      name: "City View Hotel",
      price: 159,
      rating: 4.2,
      amenities: ["Free WiFi", "Gym", "Restaurant", "Bar"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 5,
      name: "Riverside Retreat",
      price: 249,
      rating: 4.6,
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym", "River View"],
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 6,
      name: "Heritage Inn",
      price: 179,
      rating: 4.1,
      amenities: ["Free WiFi", "Breakfast", "Historic Building"],
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 7,
      name: "Modern Loft Apartments",
      price: 210,
      rating: 4.4,
      amenities: ["Free WiFi", "Kitchenette", "Gym", "Rooftop Terrace"],
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 8,
      name: "Traveler's Rest",
      price: 129,
      rating: 3.9,
      amenities: ["Free WiFi", "Breakfast", "Parking"],
      image: "https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    }
  ];
  
  // Apply filters to fallback hotels
  return filterHotels(hotels, filters);
};
