
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { useNavigate } from 'react-router-dom';
import FlightCard from './FlightCard';

interface FlightListProps {
  flights: Flight[];
  direction: 'outbound' | 'return';
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight, direction?: 'outbound' | 'return') => void;
  fromName: string;
  toName: string;
  lastFlightRef?: (node: HTMLDivElement | null) => void;
  loading?: boolean;
}

const FlightList = ({ 
  flights, 
  direction, 
  selectedFlight, 
  onSelectFlight,
  fromName,
  toName,
  lastFlightRef,
  loading = false
}: FlightListProps) => {
  const navigate = useNavigate();
  
  console.log('FlightList rendering with:', { 
    flightsCount: flights.length, 
    direction, 
    selectedFlightId: selectedFlight?.id,
    fromName,
    toName
  });
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500 mb-4">Loading flights...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500 mb-4">No flights available for this route. Try another search.</p>
          <Button onClick={() => navigate('/')}>
            Back to Search
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {flights.map((flight, index) => {
        // If this is the last item and we have a ref function, attach the ref
        if (index === flights.length - 1 && lastFlightRef) {
          return (
            <div key={flight.id} ref={lastFlightRef}>
              <FlightCard
                flight={flight}
                direction={direction}
                isSelected={selectedFlight?.id === flight.id}
                onSelect={(f) => onSelectFlight(f, direction)}
                fromName={fromName}
                toName={toName}
              />
            </div>
          );
        }
        
        return (
          <FlightCard
            key={flight.id}
            flight={flight}
            direction={direction}
            isSelected={selectedFlight?.id === flight.id}
            onSelect={(f) => onSelectFlight(f, direction)}
            fromName={fromName}
            toName={toName}
          />
        );
      })}
    </div>
  );
};

export default FlightList;
