
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import FlightFilters from './FlightFilters';

interface MobileFiltersProps {
  maxStops: number | null;
  setMaxStops: (stops: number | null) => void;
  cabinFilter: string | null;
  setCabinFilter: (cabin: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedAirlines: string[];
  setSelectedAirlines: (airlines: string[]) => void;
  airlines: string[];
  resetFilters: () => void;
}

const MobileFilters = (props: MobileFiltersProps) => {
  return (
    <div className="md:hidden mb-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <FlightFilters {...props} mobile={true} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileFilters;
