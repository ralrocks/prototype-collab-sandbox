
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FilterX } from 'lucide-react';

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
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-gray-800">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:bg-blue-50 flex items-center"
        >
          <FilterX size={16} className="mr-1" />
          Reset All
        </Button>
      </div>
      
      <div className="space-y-8">
        <div>
          <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">Stops</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <Checkbox 
                id={`${prefix}nonstop`} 
                checked={maxStops === 0}
                onCheckedChange={(checked) => setMaxStops(checked ? 0 : null)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor={`${prefix}nonstop`} className="ml-2 text-sm cursor-pointer select-none">Nonstop only</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id={`${prefix}max-1-stop`} 
                checked={maxStops === 1}
                onCheckedChange={(checked) => setMaxStops(checked ? 1 : null)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor={`${prefix}max-1-stop`} className="ml-2 text-sm cursor-pointer select-none">Max 1 stop</Label>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">Cabin Class</h4>
          <div className="space-y-3">
            {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(cabin => (
              <div key={cabin} className="flex items-center">
                <Checkbox 
                  id={`${prefix}cabin-${cabin}`} 
                  checked={cabinFilter === cabin}
                  onCheckedChange={(checked) => setCabinFilter(checked ? cabin : null)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor={`${prefix}cabin-${cabin}`} className="ml-2 text-sm cursor-pointer select-none">
                  {cabin.replace('_', ' ').charAt(0) + cabin.replace('_', ' ').slice(1).toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">Price Range</h4>
          <div className="pt-2 px-1">
            <Slider 
              defaultValue={[priceRange[0], priceRange[1]]} 
              max={2000} 
              step={50}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={(value) => setPriceRange([value[0], value[1]])}
              className="mb-6"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="w-[45%]">
              <label className="text-xs text-gray-500 mb-1 block">Min</label>
              <input 
                type="number" 
                min="0" 
                max={priceRange[1]} 
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-gray-400">-</div>
            <div className="w-[45%]">
              <label className="text-xs text-gray-500 mb-1 block">Max</label>
              <input 
                type="number" 
                min={priceRange[0]} 
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {airlines.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-gray-700 border-b pb-2">Airlines</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor={`${prefix}airline-${airline}`} className="ml-2 text-sm cursor-pointer select-none truncate">{airline}</Label>
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
