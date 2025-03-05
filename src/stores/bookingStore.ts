
import { create } from 'zustand';
import { Flight, Hotel } from '@/types';

interface Housing {
  id: number;
  title: string;
  bulletPoints: string[];
  price: number;
}

interface BookingState {
  selectedOutboundFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  selectedHousing: Housing[];
  isRoundTrip: boolean;
  skipHotels: boolean;
  setSelectedOutboundFlight: (flight: Flight) => void;
  setSelectedReturnFlight: (flight: Flight) => void;
  addHousing: (housing: Housing) => void;
  removeHousing: (housingId: number) => void;
  setSelectedHousing: (housing: Housing[]) => void;
  setIsRoundTrip: (isRoundTrip: boolean) => void;
  setSkipHotels: (skip: boolean) => void;
  calculateTotal: () => number;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
  selectedHousing: [],
  isRoundTrip: false,
  skipHotels: false,
  
  setSelectedOutboundFlight: (flight) => set({ selectedOutboundFlight: flight }),
  
  setSelectedReturnFlight: (flight) => set({ selectedReturnFlight: flight }),
  
  addHousing: (housing) => set((state) => ({
    selectedHousing: [...state.selectedHousing, housing]
  })),
  
  removeHousing: (housingId) => set((state) => ({
    selectedHousing: state.selectedHousing.filter(item => item.id !== housingId)
  })),
  
  setSelectedHousing: (housing) => set({ selectedHousing: housing }),
  
  setIsRoundTrip: (isRoundTrip) => set({ isRoundTrip }),
  
  setSkipHotels: (skip) => set({ skipHotels: skip }),
  
  calculateTotal: () => {
    const state = get();
    const outboundFlightPrice = state.selectedOutboundFlight?.price || 0;
    const returnFlightPrice = state.selectedReturnFlight?.price || 0;
    const housingTotal = state.selectedHousing.reduce((sum, item) => sum + item.price, 0);
    const additionalFees = 2500; // SAX to Section fee
    
    return outboundFlightPrice + returnFlightPrice + housingTotal + additionalFees;
  },
  
  resetBooking: () => set({
    selectedOutboundFlight: null,
    selectedReturnFlight: null,
    selectedHousing: [],
    isRoundTrip: false,
    skipHotels: false
  })
}));
