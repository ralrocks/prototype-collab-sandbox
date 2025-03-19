
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { searchCities, getSavedLocations } from '@/services/travelApi';

interface CityOption {
  code: string;
  name: string;
}

interface ComboboxDestinationProps {
  onSelect: (value: CityOption) => void;
  placeholder?: string;
  selectedValue?: string;
}

export function ComboboxDestination({
  onSelect,
  placeholder = 'Search cities or airports...',
  selectedValue = '',
}: ComboboxDestinationProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState<CityOption[]>([]);

  // Handle search input changes
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const results = await searchCities(query);
          if (isMounted) {
            setOptions(results);
          }
        } catch (error) {
          console.error('Error searching cities:', error);
          if (isMounted) {
            const savedResults = savedLocations.filter(dest => 
              dest.name.toLowerCase().includes(query.toLowerCase()) ||
              dest.code.toLowerCase().includes(query.toLowerCase())
            );
            setOptions(savedResults.length > 0 ? savedResults : popularDestinations.filter(dest => 
              dest.name.toLowerCase().includes(query.toLowerCase()) ||
              dest.code.toLowerCase().includes(query.toLowerCase())
            ));
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        // Show saved locations if query is empty or too short
        setOptions(savedLocations.length > 0 ? savedLocations.slice(0, 5) : popularDestinations);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, savedLocations]);

  // Load saved locations on component mount
  useEffect(() => {
    const locations = getSavedLocations();
    setSavedLocations(locations);
    
    // Initialize with saved locations or popular destinations
    setOptions(locations.length > 0 ? locations.slice(0, 5) : popularDestinations);
  }, []);

  // Popular destinations for quick selection
  const popularDestinations: CityOption[] = [
    { name: 'New York', code: 'NYC' },
    { name: 'Los Angeles', code: 'LAX' },
    { name: 'Chicago', code: 'ORD' },
    { name: 'San Francisco', code: 'SFO' },
    { name: 'Miami', code: 'MIA' },
    { name: 'London', code: 'LHR' },
    { name: 'Paris', code: 'CDG' },
    { name: 'Tokyo', code: 'HND' },
    { name: 'Dubai', code: 'DXB' },
    { name: 'Sydney', code: 'SYD' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
        >
          {selectedValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 shadow-lg border border-gray-200 rounded-md z-50" align="start">
        <Command className="rounded-lg border-0">
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            className="h-10"
          />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-4 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                  Searching for locations...
                </div>
              ) : (
                <p className="p-4 text-sm text-gray-500">No results found.</p>
              )}
            </CommandEmpty>
            {savedLocations.length > 0 && query.length < 2 && (
              <CommandGroup heading="Recently Used">
                {savedLocations.slice(0, 5).map((option) => (
                  <CommandItem
                    key={`saved-${option.code}`}
                    value={option.name}
                    onSelect={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-blue-600",
                        selectedValue === option.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <span className="font-medium">{option.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({option.code})</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Destinations">
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={option.name}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-blue-600",
                      selectedValue === option.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <span className="font-medium">{option.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({option.code})</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
