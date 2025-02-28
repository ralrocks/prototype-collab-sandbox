
import { Hotel } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';

/**
 * Function to get hotel recommendations using Perplexity
 */
export const fetchHotels = async (city: string, checkIn: string, checkOut: string): Promise<Hotel[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut}`);
  
  try {
    const systemPrompt = 'You are a hotel booking API. Return only valid JSON arrays of hotel data based on the query.';
    const userPrompt = `Find 5 hotels in ${city} for a stay from ${checkIn} to ${checkOut}.
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
    return extractJsonFromResponse(content);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return fallbackHotels(city);
  }
};

/**
 * Fallback hotels if API fails
 */
export const fallbackHotels = (city: string): Hotel[] => {
  return [
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
    }
  ];
};
