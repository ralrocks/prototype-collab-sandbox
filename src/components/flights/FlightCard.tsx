
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { getFlightDetails, formatDuration } from '@/services/travelApi';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { FlightHeader } from './FlightHeader';
import { FlightTiming } from './FlightTiming';
import { PriceDisplay } from './PriceDisplay';
import { FlightBadges } from './FlightBadges';
import { FlightDetails } from './FlightDetails';

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
          <FlightHeader 
            airline={flight.attribute} 
            flightNumber={flight.details?.flightNumber} 
          />
          
          <FlightTiming 
            departureTime={flight.details?.departureTime}
            arrivalTime={flight.details?.arrivalTime}
            duration={flight.details ? formatDuration(flight.details.duration) : undefined}
            fromName={fromName}
            toName={toName}
            direction={direction}
          />
          
          <PriceDisplay 
            price={flight.price}
            isSelected={isSelected}
            onSelect={() => onSelect(flight, direction)}
          />
        </div>
        
        {flight.details && (
          <FlightBadges 
            departureTime={flight.details.departureTime}
            arrivalTime={flight.details.arrivalTime}
            cabin={flight.details.cabin}
            stops={flight.details.stops}
            aircraft={flight.details.aircraft}
          />
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
            <FlightDetails 
              detailsLoading={detailsLoading}
              flight={flight}
              additionalDetails={additionalDetails}
              openBookingLink={openBookingLink}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FlightCard;
