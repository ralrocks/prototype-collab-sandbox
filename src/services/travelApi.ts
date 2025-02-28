
interface FlightApiResponse {
  data: ApiFlightData[];
}

interface ApiFlightData {
  flight_date: string;
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  airline: {
    name: string;
  };
  departure: {
    airport: string;
    iata: string;
  };
  arrival: {
    airport: string;
    iata: string;
  };
  flight_status: string;
}

// This is a mock implementation that simulates fetching from an API
// but actually returns hardcoded data to avoid API key requirements
export const fetchFlights = async (from: string, to: string): Promise<ApiFlightData[]> => {
  console.log(`Fetching flights from ${from} to ${to}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data since we're not using a real API key
  return [
    {
      flight_date: "2023-06-10",
      flight: { number: "1234", iata: "DL1234", icao: "DAL1234" },
      airline: { name: "Delta Airlines" },
      departure: { airport: "Los Angeles International", iata: "LAX" },
      arrival: { airport: "John F. Kennedy International", iata: "JFK" },
      flight_status: "scheduled"
    },
    {
      flight_date: "2023-06-10",
      flight: { number: "2345", iata: "AS2345", icao: "ASA2345" },
      airline: { name: "Alaska Airlines" },
      departure: { airport: "Los Angeles International", iata: "LAX" },
      arrival: { airport: "John F. Kennedy International", iata: "JFK" },
      flight_status: "scheduled"
    },
    {
      flight_date: "2023-06-10",
      flight: { number: "3456", iata: "NK3456", icao: "NKS3456" },
      airline: { name: "Spirit" },
      departure: { airport: "Los Angeles International", iata: "LAX" },
      arrival: { airport: "John F. Kennedy International", iata: "JFK" },
      flight_status: "scheduled"
    },
    {
      flight_date: "2023-06-10",
      flight: { number: "4567", iata: "B64567", icao: "JBU4567" },
      airline: { name: "JetBlue" },
      departure: { airport: "Los Angeles International", iata: "LAX" },
      arrival: { airport: "John F. Kennedy International", iata: "JFK" },
      flight_status: "scheduled"
    }
  ];
};

// Helper function to transform API data to our application's format
export const transformFlightData = (apiData: ApiFlightData[]): Flight[] => {
  return apiData.map((flight, index) => ({
    id: index + 1,
    attribute: flight.airline.name,
    question1: `${flight.departure.iata} → ${flight.arrival.iata}`,
    price: 150 + Math.floor(Math.random() * 100), // Random price between 150-250
  }));
};
