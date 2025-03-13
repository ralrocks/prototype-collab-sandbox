
import { useState, useMemo } from 'react';
import { Flight } from '@/types';

export const useFlightFilters = (flights: Flight[]) => {
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  
  const airlines = useMemo(() => 
    [...new Set(flights.map(f => f.attribute))], 
    [flights]
  );
  
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = [...flights];
    
    if (cabinFilter) {
      filtered = filtered.filter(f => 
        f.details?.cabin?.toUpperCase() === cabinFilter
      );
    }
    
    if (maxStops !== null) {
      filtered = filtered.filter(f => 
        f.details?.stops !== undefined && f.details.stops <= maxStops
      );
    }
    
    filtered = filtered.filter(f => 
      f.price >= priceRange[0] && f.price <= priceRange[1]
    );
    
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => 
        selectedAirlines.includes(f.attribute)
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      if (a.details?.departureTime && b.details?.departureTime) {
        return new Date(a.details.departureTime).getTime() - new Date(b.details.departureTime).getTime();
      }
      return 0;
    });
  }, [flights, sortBy, cabinFilter, maxStops, priceRange, selectedAirlines]);

  const resetFilters = () => {
    setCabinFilter(null);
    setMaxStops(null);
    setPriceRange([0, 2000]);
    setSelectedAirlines([]);
  };

  return {
    sortBy,
    setSortBy,
    cabinFilter,
    setCabinFilter,
    maxStops, 
    setMaxStops,
    priceRange,
    setPriceRange,
    selectedAirlines,
    setSelectedAirlines,
    airlines,
    filteredAndSortedFlights,
    resetFilters
  };
};
