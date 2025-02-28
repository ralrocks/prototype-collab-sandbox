
import { create } from 'zustand';
import { Flight } from '@/types';

interface Housing {
  id: number;
  title: string;
  bulletPoints: string[];
  price: number;
}

interface BookingState {
  selectedFlight: Flight | null;
  selectedHousing: Housing[];
  setSelectedFlight: (flight: Flight) => void;
  addHousing: (housing: Housing) => void;
  removeHousing: (housingId: number) => void;
  calculateTotal: () => number;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedFlight: null,
  selectedHousing: [],
  
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  
  addHousing: (housing) => set((state) => ({
    selectedHousing: [...state.selectedHousing, housing]
  })),
  
  removeHousing: (housingId) => set((state) => ({
    selectedHousing: state.selectedHousing.filter(item => item.id !== housingId)
  })),
  
  calculateTotal: () => {
    const state = get();
    const flightPrice = state.selectedFlight?.price || 0;
    const housingTotal = state.selectedHousing.reduce((sum, item) => sum + item.price, 0);
    const additionalFees = 2500; // SAX to Section fee
    
    return flightPrice + housingTotal + additionalFees;
  },
  
  resetBooking: () => set({
    selectedFlight: null,
    selectedHousing: []
  })
}));
