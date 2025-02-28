
export interface Flight {
  id: number;
  attribute: string;
  question1: string;
  price: number;
  details?: {
    flightNumber: string;
    duration: string;
    departureTime: string;
    arrivalTime: string;
    cabin: string;
    stops: number;
  };
}

export interface Hotel {
  id: number;
  name: string;
  price: number;
  rating: number;
  amenities: string[];
  image: string;
  location: string;
}
