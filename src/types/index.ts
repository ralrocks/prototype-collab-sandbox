
export interface Flight {
  id: number;
  attribute: string;
  question1: string;
  price: number;
  tripType?: 'oneway' | 'roundtrip';
  details?: {
    flightNumber: string;
    duration: string;
    departureTime: string;
    arrivalTime: string;
    cabin: string;
    stops: number;
    airline?: string;
    departureAirport?: string;
    arrivalAirport?: string;
    aircraft?: string;
    bookingLink?: string;
    amenities?: string[];
    baggageAllowance?: string;
    cancellationPolicy?: string;
    onTimePerformance?: string;
    terminalInfo?: {
      departure?: string;
      arrival?: string;
    };
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
  brand?: string;
  description?: string;
  bookingLink?: string;
  roomTypes?: {
    name: string;
    price: number;
    description: string;
  }[];
  policies?: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  currency: string;
  language: string;
  darkMode: boolean;
}
