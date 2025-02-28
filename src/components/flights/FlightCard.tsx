
import { Check, Clock, Info, Plane } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';

interface FlightCardProps {
  flight: Flight;
  direction: 'outbound' | 'return';
  isSelected: boolean;
  onSelect: (flight: Flight, direction: 'outbound' | 'return') => void;
  fromName: string;
  toName: string;
}

const FlightCard = ({ 
  flight, 
  direction, 
  isSelected, 
  onSelect,
  fromName,
  toName
}: FlightCardProps) => {
  return (
    <Card 
      key={flight.id} 
      className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
        isSelected ? 'border-green-500' : 'border-transparent'
      }`}
      onClick={() => onSelect(flight, direction)}
    >
      <CardContent className="p-0">
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Plane className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-medium">{flight.attribute}</h3>
              <p className="text-sm text-gray-500">
                {flight.details?.flightNumber || "Flight number unavailable"}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium">{direction === 'outbound' ? fromName : toName}</span>
              <div className="w-12 h-px bg-gray-300 relative">
                <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -right-1"></div>
              </div>
              <span className="font-medium">{direction === 'outbound' ? toName : fromName}</span>
            </div>
            <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
              <Clock size={14} className="mr-1" />
              {flight.details ? formatDuration(flight.details.duration) : "Duration unavailable"}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">${flight.price}</span>
              <p className="text-xs text-gray-500">per person</p>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={isSelected ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {isSelected ? (
                        <>
                          <Check size={16} className="mr-1" />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSelected 
                      ? "This flight is selected" 
                      : "Click to select this flight"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {flight.details && (
          <div className="border-t px-4 md:px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white">
              <Clock size={14} className="mr-1" /> {new Date(flight.details.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {flight.details.cabin || "ECONOMY"}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {flight.details.stops === 0 ? 'Nonstop' : `${flight.details.stops} stop${flight.details.stops > 1 ? 's' : ''}`}
            </Badge>
            <Badge variant="outline" className="bg-white">
              <Info size={14} className="mr-1" /> Includes 1 carry-on bag
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Format duration utility function
const formatDuration = (duration: string) => {
  try {
    // Simple PT5H30M format parser
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return 'Duration unavailable';
  }
};

export default FlightCard;
