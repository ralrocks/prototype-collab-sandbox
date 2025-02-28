
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/services/travelApi";
import { toast } from "sonner";

interface ComboboxDestinationProps {
  placeholder: string;
  onSelect: (value: { code: string; name: string }) => void;
  selectedValue?: string;
}

export function ComboboxDestination({ placeholder, onSelect, selectedValue }: ComboboxDestinationProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  
  const { data: options = [], isLoading, error } = useQuery({
    queryKey: ["cities", searchValue],
    queryFn: () => searchCities(searchValue),
    enabled: searchValue.length > 0 || open,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  if (error) {
    console.error("Error fetching cities:", error);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedValue
            ? selectedValue
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-sm text-center text-gray-500">Loading...</div>
            ) : (
              <>
                <CommandEmpty>No results found</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.code}
                      value={option.code}
                      onSelect={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === option.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
