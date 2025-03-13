
import { useState } from 'react';
import { Check, Clock, Info, Plane, Calendar, AlertTriangle, ChevronDown, ChevronUp, LuggageIcon, DollarSign, ExternalLink, CircleAlert } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { formatDuration, getFlightDetails } from '@/services/travelApi';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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
  const [expanded, setExpanded] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState<any>(null);
  
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

  const loadAdditionalDetails = async () => {
    if (expanded && !additionalDetails && !detailsLoading) {
      setDetailsLoading(true);
      try {
        const details = await getFlightDetails(flight);
        setAdditionalDetails(details);
      } catch (error) {
        console.error('Error loading flight details:', error);
        toast.error('Could not load additional flight details');
      } finally {
        setDetailsLoading(false);
      }
    }
  };

  const handleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (newExpandedState) {
      loadAdditionalDetails();
    }
  };

  const openBookingLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flight.details?.bookingLink) {
      window.open(flight.details.bookingLink, '_blank');
    } else {
      toast.error('Booking link not available');
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
              <Info size={14} className="mr-1" /> {flight.details.aircraft || 'Boeing 737'}
            </Badge>
            
            {getFormattedDate(flight.details.departureTime) && (
              <Badge variant="outline" className="bg-white">
                <Calendar size={14} className="mr-1" /> 
                {getFormattedDate(flight.details.departureTime)}
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-blue-600" 
              onClick={openBookingLink}
            >
              <ExternalLink size={14} className="mr-1" /> Book
            </Button>
          </div>
        )}
        
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full border-t border-gray-200 flex items-center justify-center py-2"
              onClick={handleExpand}
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} className="mr-1" /> Hide details
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" /> Show more details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-gray-50 p-4 border-t border-gray-200">
            {detailsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Flight Information */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Flight Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Airline:</p>
                      <p>{flight.attribute}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Flight Number:</p>
                      <p>{flight.details?.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aircraft:</p>
                      <p>{flight.details?.aircraft || 'Information not available'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">On-time Performance:</p>
                      <p>{flight.details?.onTimePerformance || 'Information not available'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Terminal Information */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Terminal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Departure Terminal:</p>
                      <p>{flight.details?.terminalInfo?.departure || 'Information not available'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Arrival Terminal:</p>
                      <p>{flight.details?.terminalInfo?.arrival || 'Information not available'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Baggage and Policies */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Baggage & Policies</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Baggage Allowance:</p>
                      <p>{flight.details?.baggageAllowance || 'Information not available'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cancellation Policy:</p>
                      <p>{flight.details?.cancellationPolicy || 'Information not available'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Amenities */}
                {flight.details?.amenities && flight.details.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {flight.details.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional AI-generated details */}
                {additionalDetails && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Additional Information</h4>
                    <div className="text-sm space-y-2">
                      {Object.entries(additionalDetails).map(([key, value]: [string, any]) => {
                        // Skip displaying empty values or keys that are already shown
                        if (!value || 
                            ['airline', 'flightNumber', 'aircraft'].includes(key.toLowerCase())) {
                          return null;
                        }
                        
                        return (
                          <div key={key}>
                            <p className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</p>
                            <p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={openBookingLink}
                  >
                    <ExternalLink size={14} className="mr-1" /> View & Book on Airline Website
                  </Button>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FlightCard;
