
import { Flight } from '@/types';

// Amadeus API types
interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }[];
  }[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees: {
      amount: string;
      type: string;
    }[];
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }[];
  }[];
}

interface AmadeusFlightResponse {
  data: AmadeusFlightOffer[];
  dictionaries?: {
    carriers?: Record<string, string>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    locations?: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
  };
}

interface AmadeusTokenResponse {
  type: string;
  username: string;
  application_name: string;
  client_id: string;
  token_type: string;
  access_token: string;
  expires_in: number;
  state: string;
  scope: string;
}

// Mock carrier data until we get it from API
const carriers: Record<string, string> = {
  'DL': 'Delta Air Lines',
  'AA': 'American Airlines',
  'UA': 'United Airlines',
  'B6': 'JetBlue',
  'AS': 'Alaska Airlines',
  'WN': 'Southwest Airlines',
  'NK': 'Spirit Airlines',
  'F9': 'Frontier Airlines',
  'HA': 'Hawaiian Airlines',
  'G4': 'Allegiant Air',
};

// Variables to store token data
let amadeus_token: string | null = null;
let token_expiry: number | null = null;

// Get Amadeus API token
const getAmadeusToken = async (): Promise<string> => {
  // Check if we have a valid token
  if (amadeus_token && token_expiry && Date.now() < token_expiry) {
    return amadeus_token;
  }

  console.log('Getting new Amadeus token');
  
  try {
    // Simulate API token response
    // In production: 
    // const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     'grant_type': 'client_credentials',
    //     'client_id': 'YOUR_API_KEY',
    //     'client_secret': 'YOUR_API_SECRET'
    //   })
    // });
    // const data = await response.json();

    // Mock token response
    const mockTokenResponse: AmadeusTokenResponse = {
      type: "amadeusOAuth2Token",
      username: "mock_user",
      application_name: "TravelBooker",
      client_id: "mock_client_id",
      token_type: "Bearer",
      access_token: "mock_access_token_" + Math.random().toString(36).substring(2),
      expires_in: 1800,
      state: "approved",
      scope: ""
    };

    // Save token and expiry
    amadeus_token = mockTokenResponse.access_token;
    token_expiry = Date.now() + (mockTokenResponse.expires_in * 1000);
    
    return amadeus_token;
  } catch (error) {
    console.error('Error getting Amadeus token:', error);
    throw new Error('Failed to get authorization token');
  }
};

export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}${returnDate ? ` with return on ${returnDate}` : ''}`);
  
  try {
    // In production implementation, get the token and use it to fetch flights
    const token = await getAmadeusToken();
    
    // For development purposes, we'll use a mock response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Generate random flight offers
    const mockFlightOffers: AmadeusFlightOffer[] = Array(6).fill(null).map((_, index) => {
      const randomCarrierKeys = Object.keys(carriers);
      const carrierCode = randomCarrierKeys[Math.floor(Math.random() * randomCarrierKeys.length)];
      const price = 150 + Math.floor(Math.random() * 400);
      
      // Create dates for departure and arrival that are safe to use
      const today = new Date();
      const depDate = new Date();
      depDate.setDate(today.getDate() + 10 + Math.floor(Math.random() * 5));
      depDate.setHours(10 + Math.floor(Math.random() * 8));
      depDate.setMinutes(Math.floor(Math.random() * 60));
      
      // Format date as an ISO string
      const depDateTime = depDate.toISOString();
      
      // Calculate arrival time (3-6 hours after departure)
      const arrDate = new Date(depDate);
      arrDate.setHours(arrDate.getHours() + 3 + Math.floor(Math.random() * 3));
      const arrDateTime = arrDate.toISOString();
      
      // Create a valid lastTicketingDate
      const ticketingDate = new Date(today);
      ticketingDate.setDate(today.getDate() + 5);
      const lastTicketingDate = ticketingDate.toISOString().split('T')[0];
      
      return {
        id: `${index + 1}`,
        source: "GDS",
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: tripType === 'oneway',
        lastTicketingDate: lastTicketingDate,
        numberOfBookableSeats: 9,
        itineraries: [
          {
            duration: "PT5H30M",
            segments: [
              {
                departure: {
                  iataCode: from,
                  at: depDateTime
                },
                arrival: {
                  iataCode: to,
                  at: arrDateTime
                },
                carrierCode: carrierCode,
                number: `${Math.floor(Math.random() * 9000) + 1000}`,
                aircraft: {
                  code: "32N"
                },
                operating: {
                  carrierCode: carrierCode
                },
                duration: "PT5H30M",
                id: `${index}`,
                numberOfStops: 0,
                blacklistedInEU: false
              }
            ]
          }
        ],
        price: {
          currency: "USD",
          total: price.toString(),
          base: (price - 50).toString(),
          fees: [
            {
              amount: "50.00",
              type: "SUPPLIER"
            }
          ],
          grandTotal: price.toString()
        },
        pricingOptions: {
          fareType: ["PUBLISHED"],
          includedCheckedBagsOnly: false
        },
        validatingAirlineCodes: [carrierCode],
        travelerPricings: [
          {
            travelerId: "1",
            fareOption: "STANDARD",
            travelerType: "ADULT",
            price: {
              currency: "USD",
              total: price.toString(),
              base: (price - 50).toString()
            },
            fareDetailsBySegment: [
              {
                segmentId: "1",
                cabin: "ECONOMY",
                fareBasis: "ELIGHT",
                class: "E",
                includedCheckedBags: {
                  quantity: 1
                }
              }
            ]
          }
        ]
      };
    });
    
    // Mock API response
    const mockApiResponse: AmadeusFlightResponse = {
      data: mockFlightOffers,
      dictionaries: {
        carriers: carriers
      }
    };
    
    // Transform the flights to our application format
    return transformFlightData(mockApiResponse, tripType);
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
};

// Helper function to transform API data to our application's format
export const transformFlightData = (apiResponse: AmadeusFlightResponse, tripType: 'oneway' | 'roundtrip' = 'oneway'): Flight[] => {
  return apiResponse.data.map((flight) => {
    try {
      // Get basic flight details
      const carrierCode = flight.validatingAirlineCodes[0] || flight.itineraries[0].segments[0].carrierCode;
      const airlineName = apiResponse.dictionaries?.carriers?.[carrierCode] || carriers[carrierCode] || "Unknown Airline";
      const segment = flight.itineraries[0].segments[0];
      const departure = segment.departure.iataCode;
      const arrival = segment.arrival.iataCode;
      
      // Parse dates safely
      let departureTime: Date | null = null;
      let arrivalTime: Date | null = null;
      
      try {
        departureTime = new Date(segment.departure.at);
        arrivalTime = new Date(segment.arrival.at);
        
        // Check if dates are valid
        if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        console.error('Invalid date in flight data:', error);
        // Use current time plus offsets as fallback
        const now = new Date();
        departureTime = new Date(now.getTime() + 3600000); // +1 hour
        arrivalTime = new Date(now.getTime() + 7200000);   // +2 hours
      }
      
      // Format times for display
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      };
      
      // Calculate price from the API response
      const price = parseInt(flight.price.total);
      
      // Ensure we have valid ISO strings for dates
      const departureDateISOString = departureTime.toISOString();
      const arrivalDateISOString = arrivalTime.toISOString();
      
      return {
        id: parseInt(flight.id),
        attribute: airlineName,
        question1: `${departure} → ${arrival} (${formatTime(departureTime)} - ${formatTime(arrivalTime)})`,
        price: price,
        tripType: tripType,
        // Add additional details that might be useful
        details: {
          flightNumber: `${carrierCode}${segment.number}`,
          duration: flight.itineraries[0].duration,
          departureTime: departureDateISOString,
          arrivalTime: arrivalDateISOString,
          cabin: flight.travelerPricings[0].fareDetailsBySegment[0].cabin,
          stops: segment.numberOfStops
        }
      };
    } catch (error) {
      console.error('Error transforming flight data:', error);
      // Return a default flight object on error
      return {
        id: parseInt(flight.id || '0'),
        attribute: 'Unknown Airline',
        question1: 'Unknown Route',
        price: 0,
        tripType: tripType,
        details: {
          flightNumber: 'N/A',
          duration: 'PT0H',
          departureTime: new Date().toISOString(),
          arrivalTime: new Date().toISOString(),
          cabin: 'ECONOMY',
          stops: 0
        }
      };
    }
  });
};

// Function to get hotel recommendations (mock implementation)
export const fetchHotels = async (city: string, checkIn: string, checkOut: string): Promise<any[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock hotel data
  // In production, you would integrate with Amadeus Hotel API
  const hotels = [
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
      name: "Seaside Resort",
      price: 259,
      rating: 4.6,
      amenities: ["Beach Access", "Pool", "Spa", "Restaurant", "Bar"],
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    },
    {
      id: 5,
      name: "City Center Inn",
      price: 159,
      rating: 4.2,
      amenities: ["Free WiFi", "Gym", "Restaurant"],
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      location: city
    }
  ];
  
  return hotels;
};

// Perplexity API integration for travel recommendations
export const getDestinationInfo = async (destination: string): Promise<string> => {
  // In production, you would use actual Perplexity API key
  // const apiKey = process.env.PERPLEXITY_API_KEY or from localStorage
  
  console.log(`Getting information about ${destination}`);
  
  // This is a mock implementation
  // In production you would use the actual Perplexity API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const destinations: Record<string, string> = {
    "New York": "New York City is known for its iconic skyline, Broadway shows, and cultural diversity. Top attractions include Times Square, Central Park, the Statue of Liberty, and the Metropolitan Museum of Art. The best time to visit is spring (April to June) or fall (September to November) for mild weather. Don't miss trying authentic New York pizza, bagels, and exploring the diverse neighborhoods like SoHo, Greenwich Village, and Chinatown.",
    "Los Angeles": "Los Angeles is famous for Hollywood, beaches, and year-round sunshine. Visitors can explore the Walk of Fame, Universal Studios, Getty Center, and Santa Monica Pier. The weather is pleasant year-round, but spring and fall offer the most comfortable temperatures. The city has excellent Mexican food, fresh seafood, and trendy restaurants. Be prepared for traffic and consider renting a car to get around this sprawling city.",
    "Miami": "Miami is known for its beautiful beaches, vibrant nightlife, and Latin influences. South Beach, Art Deco Historic District, and Wynwood Walls are must-visit attractions. The best time to visit is between November and April when humidity is lower. The city offers exceptional Cuban cuisine, fresh seafood, and tropical cocktails. Miami is also a gateway to the Florida Keys and Everglades National Park.",
    "Chicago": "Chicago offers stunning architecture, world-class museums, and food scene featuring deep dish pizza and Chicago-style hot dogs. The city shines in summer with Lake Michigan beaches and outdoor festivals, though spring and fall offer pleasant weather with fewer crowds. Visit Millennium Park, The Art Institute, Willis Tower, and take an architecture river cruise to appreciate the city's famous skyline.",
    "San Francisco": "San Francisco is known for the Golden Gate Bridge, cable cars, and Victorian houses. The city offers unique experiences like Alcatraz Island, Fisherman's Wharf, and Chinatown. Weather is mild year-round but often foggy in summer. The city is a culinary destination with excellent seafood, sourdough bread, and diverse international cuisine. Be prepared for hills and bring layers as temperatures can fluctuate throughout the day."
  };
  
  return destinations[destination] || 
    `${destination} is a popular travel destination. You can explore local attractions, try regional cuisine, and experience the unique culture. For specific travel tips and recommendations, consider researching current travel guides or asking locals for suggestions.`;
};
