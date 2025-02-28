
import { Flight } from '@/types';

// Mock carrier data
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

// Mock flight data generator with reliable dates
export const fetchFlights = async (
  from: string, 
  to: string, 
  departureDate: string = '2023-12-10',
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
): Promise<Flight[]> => {
  console.log(`Fetching ${tripType} flights from ${from} to ${to} for ${departureDate}${returnDate ? ` with return on ${returnDate}` : ''}`);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
    
    // Generate reliable mock flight data
    const mockFlights: Flight[] = [];
    
    // Generate 6 flight options
    for (let i = 0; i < 6; i++) {
      const randomCarrierKeys = Object.keys(carriers);
      const carrierCode = randomCarrierKeys[Math.floor(Math.random() * randomCarrierKeys.length)];
      const airlineName = carriers[carrierCode] || "Unknown Airline";
      
      // Base price with some randomness
      const price = 150 + Math.floor(Math.random() * 400);
      
      // Create departure and arrival times
      const departureTime = new Date(depDate);
      departureTime.setHours(8 + i); // Different hours for different flights
      departureTime.setMinutes(Math.floor(Math.random() * 60));
      
      // Arrival is 3-5 hours after departure
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + 3 + Math.floor(Math.random() * 3));
      
      // Duration in ISO8601 format
      const durationHours = Math.floor((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60 * 60));
      const durationMinutes = Math.floor(((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60)) % 60);
      const duration = `PT${durationHours}H${durationMinutes}M`;
      
      // Flight number
      const flightNumber = `${carrierCode}${1000 + Math.floor(Math.random() * 9000)}`;
      
      // Number of stops (mostly direct flights)
      const stops = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
      
      // Cabin types
      const cabinTypes = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
      const cabin = cabinTypes[Math.floor(Math.random() * 2)]; // Mostly economy or premium economy
      
      mockFlights.push({
        id: i + 1,
        attribute: airlineName,
        question1: `${from} → ${to} (${departureTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
        price: price,
        tripType: tripType,
        details: {
          flightNumber: flightNumber,
          duration: duration,
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          cabin: cabin,
          stops: stops
        }
      });
    }
    
    return mockFlights;
  } catch (error) {
    console.error('Error generating mock flight data:', error);
    throw new Error('Failed to load flight data. Please try again.');
  }
};

// Function to get hotel recommendations (mock implementation)
export const fetchHotels = async (city: string, checkIn: string, checkOut: string): Promise<any[]> => {
  console.log(`Fetching hotels in ${city} from ${checkIn} to ${checkOut}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock hotel data
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
  console.log(`Getting information about ${destination}`);
  
  // This is a mock implementation
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
