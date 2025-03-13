
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FlightFiltersProps {
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
  mobile?: boolean;
}

const FlightFilters = ({
  maxStops,
  setMaxStops,
  cabinFilter,
  setCabinFilter,
  priceRange,
  setPriceRange,
  selectedAirlines,
  setSelectedAirlines,
  airlines,
  resetFilters,
  mobile = false
}: FlightFiltersProps) => {
  const prefix = mobile ? 'mobile-' : '';
  
  return (
    <div className={mobile ? "py-4" : ""}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-xs text-blue-600"
        >
          Reset
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Stops</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id={`${prefix}nonstop`} 
                checked={maxStops === 0}
                onCheckedChange={(checked) => setMaxStops(checked ? 0 : null)}
              />
              <Label htmlFor={`${prefix}nonstop`} className="ml-2">Nonstop only</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id={`${prefix}max-1-stop`} 
                checked={maxStops === 1}
                onCheckedChange={(checked) => setMaxStops(checked ? 1 : null)}
              />
              <Label htmlFor={`${prefix}max-1-stop`} className="ml-2">Max 1 stop</Label>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Cabin Class</h4>
          <div className="space-y-2">
            {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(cabin => (
              <div key={cabin} className="flex items-center">
                <Checkbox 
                  id={`${prefix}cabin-${cabin}`} 
                  checked={cabinFilter === cabin}
                  onCheckedChange={(checked) => setCabinFilter(checked ? cabin : null)}
                />
                <Label htmlFor={`${prefix}cabin-${cabin}`} className="ml-2">
                  {cabin.replace('_', ' ').charAt(0) + cabin.replace('_', ' ').slice(1).toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Price Range</h4>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              min="0" 
              max={priceRange[1]} 
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-24 p-2 border rounded text-sm"
            />
            <span>to</span>
            <input 
              type="number" 
              min={priceRange[0]} 
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
              className="w-24 p-2 border rounded text-sm"
            />
          </div>
        </div>

        {airlines.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Airlines</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {airlines.map(airline => (
                <div key={airline} className="flex items-center">
                  <Checkbox 
                    id={`${prefix}airline-${airline}`} 
                    checked={selectedAirlines.includes(airline)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAirlines([...selectedAirlines, airline]);
                      } else {
                        setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                      }
                    }}
                  />
                  <Label htmlFor={`${prefix}airline-${airline}`} className="ml-2">{airline}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightFilters;
