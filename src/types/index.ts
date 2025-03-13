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

export interface CarRental {
  id: number;
  company: string;
  image: string;
  carType: string;
  pricePerDay: number;
  totalPrice: number;
  location: string;
  features: string[];
  availability: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface TravelPackage {
  id: number;
  name: string;
  agency: string;
  image: string;
  packageType: string;
  totalPrice: number;
  pricePerPerson: number;
  duration: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  rating: number;
  inclusions: string[];
  url: string;
}
