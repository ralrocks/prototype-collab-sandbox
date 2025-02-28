
import { Flight } from '@/types';

// Base API configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Function to search for flights using Perplexity AI
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}${returnDate ? ` with return on ${returnDate}` : ''}`);
  
  try {
    // Format dates for better readability
    const formattedDepartureDate = formatDateForDisplay(departureDate);
    const formattedReturnDate = returnDate ? formatDateForDisplay(returnDate) : undefined;
    
    // Build the prompt for Perplexity
    const prompt = `Search for ${tripType === 'roundtrip' ? 'round-trip' : 'one-way'} flights from ${from} to ${to} on ${formattedDepartureDate}${formattedReturnDate ? ` with return on ${formattedReturnDate}` : ''}. 
    Format the results as a structured JSON array of exactly 6 flight options. 
    Each flight should include: airline name, flight number, departure time, arrival time, duration, number of stops (0 for non-stop), cabin class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST), and price in USD.
    Don't include any explanation, just return valid JSON that can be parsed with JSON.parse().
    Format the response exactly like this example:
    [
      {
        "airline": "Delta Air Lines",
        "flightNumber": "DL1234",
        "departureTime": "2023-12-10T08:30:00.000Z",
        "arrivalTime": "2023-12-10T11:45:00.000Z",
        "duration": "PT3H15M",
        "stops": 0,
        "cabin": "ECONOMY",
        "price": 299
      },
      ...5 more similar objects
    ]`;
    
    // Retrieve API key from local storage or environment
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not found. Please add your API key in settings.');
    }
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a flight search API. You return ONLY valid JSON arrays of flight information based on the user query. No explanations, just data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the content from Perplexity response
    const content = data.choices[0].message.content;
    
    // Parse the JSON string from the response
    let flightData;
    try {
      // Find JSON in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flightData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing JSON from Perplexity:', parseError, content);
      throw new Error('Failed to parse flight data');
    }
    
    // Transform the data to match our Flight type
    return flightData.map((flight: any, index: number) => ({
      id: index + 1,
      attribute: flight.airline,
      question1: `${from} → ${to} (${new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
      price: flight.price,
      tripType: tripType,
      details: {
        flightNumber: flight.flightNumber,
        duration: flight.duration,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        cabin: flight.cabin,
        stops: flight.stops
      }
    }));
  } catch (error) {
    console.error('Error fetching flight data:', error);
    // Return a minimal set of fallback flights if the API fails
    return generateFallbackFlights(from, to, departureDate);
  }
};

// Format date for display (Month Day, Year)
const formatDateForDisplay = (dateString: string): string => {
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

// Generate fallback flights if API fails
const generateFallbackFlights = (
  from: string, 
  to: string, 
  departureDate: string,
): Flight[] => {
  console.log('Using fallback flights data');
  
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
  
  for (let i = 0; i < 3; i++) {
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

// City search function using Perplexity
export const searchCities = async (query: string): Promise<{code: string, name: string}[]> => {
  console.log(`Searching cities matching: ${query}`);
  
  if (!query || query.length < 2) return [];
  
  try {
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not found');
    }
    
    const prompt = `Search for major cities and their airport codes that match "${query}". 
    Return results as a JSON array with exactly 5 cities that best match the query.
    Each result should have 'code' (airport code) and 'name' (city name).
    Format: [{"code": "JFK", "name": "New York"}, ...]. 
    Just return the JSON array, no explanations.`;
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an airport database API. Return only valid JSON arrays of airport/city data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (parseError) {
      console.error('Error parsing city data:', parseError);
      return fallbackCitySearch(query);
    }
  } catch (error) {
    console.error('Error searching cities:', error);
    return fallbackCitySearch(query);
  }
};

// Fallback city search with common cities
const fallbackCitySearch = (query: string): {code: string, name: string}[] => {
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

// Get destination information using Perplexity
export const getDestinationInfo = async (destination: string): Promise<string> => {
  console.log(`Getting information about ${destination}`);
  
  try {
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not found');
    }
    
    const prompt = `Provide a concise travel guide for ${destination}. Include key attractions, best time to visit, and local food recommendations. Keep it under 500 characters.`;
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a travel guide assistant. Provide concise, helpful travel information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching destination info:', error);
    return `${destination} is a popular travel destination. You can explore local attractions, try regional cuisine, and experience the unique culture. For specific travel tips and recommendations, consider researching current travel guides or asking locals for suggestions.`;
  }
};

// Function to get hotel recommendations using Perplexity
export const fetchHotels = async (city: string, checkIn: string, checkOut: string): Promise<any[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut}`);
  
  try {
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not found');
    }
    
    const prompt = `Find 5 hotels in ${city} for a stay from ${checkIn} to ${checkOut}.
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
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a hotel booking API. Return only valid JSON arrays of hotel data based on the query.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (parseError) {
      console.error('Error parsing hotel data:', parseError);
      return fallbackHotels(city);
    }
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return fallbackHotels(city);
  }
};

// Fallback hotels if API fails
const fallbackHotels = (city: string): any[] => {
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
