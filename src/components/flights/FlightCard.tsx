
import { Check, Clock, Info, Plane, Calendar, AlertTriangle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { formatDuration } from '@/services/travelApi';

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
  // Format departure and arrival times
  const getDepartureTime = () => {
    if (!flight.details?.departureTime) return 'N/A';
    try {
      return new Date(flight.details.departureTime).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error parsing departure time:', e);
      return 'N/A';
    }
  };
  
  const getArrivalTime = () => {
    if (!flight.details?.arrivalTime) return 'N/A';
    try {
      return new Date(flight.details.arrivalTime).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error parsing arrival time:', e);
      return 'N/A';
    }
  };
  
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error parsing date:', e);
      return '';
    }
  };
  
  // Check if departure and arrival dates are different
  const isDifferentDay = () => {
    if (!flight.details?.departureTime || !flight.details?.arrivalTime) return false;
    try {
      const departureDate = new Date(flight.details.departureTime).toDateString();
      const arrivalDate = new Date(flight.details.arrivalTime).toDateString();
      return departureDate !== arrivalDate;
    } catch (e) {
      console.error('Error comparing dates:', e);
      return false;
    }
  };
  
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
              <div className="text-right">
                <div className="font-medium">{getDepartureTime()}</div>
                <div className="text-xs text-gray-500">{direction === 'outbound' ? fromName : toName}</div>
              </div>
              
              <div className="w-16 h-px bg-gray-300 relative">
                <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -right-1"></div>
                <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -left-1"></div>
              </div>
              
              <div className="text-left">
                <div className="font-medium">{getArrivalTime()}</div>
                <div className="text-xs text-gray-500">{direction === 'outbound' ? toName : fromName}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
              <Clock size={14} className="mr-1" />
              {flight.details ? formatDuration(flight.details.duration) : "Duration unavailable"}
              
              {isDifferentDay() && (
                <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                  <Calendar size={12} className="mr-1" /> +1 day
                </Badge>
              )}
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
              <Clock size={14} className="mr-1" /> {getDepartureTime()} - {getArrivalTime()}
            </Badge>
            
            <Badge variant="outline" className="bg-white">
              {flight.details.cabin || "ECONOMY"}
            </Badge>
            
            <Badge variant="outline" className={`bg-white ${flight.details.stops > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {flight.details.stops === 0 ? 'Nonstop' : `${flight.details.stops} stop${flight.details.stops > 1 ? 's' : ''}`}
            </Badge>
            
            <Badge variant="outline" className="bg-white">
              <Info size={14} className="mr-1" /> Includes 1 carry-on bag
            </Badge>
            
            {getFormattedDate(flight.details.departureTime) && (
              <Badge variant="outline" className="bg-white">
                <Calendar size={14} className="mr-1" /> 
                {getFormattedDate(flight.details.departureTime)}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlightCard;
