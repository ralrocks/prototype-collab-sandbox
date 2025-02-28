
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { useNavigate } from 'react-router-dom';
import FlightCard from './FlightCard';

interface FlightListProps {
  flights: Flight[];
  direction: 'outbound' | 'return';
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight, direction: 'outbound' | 'return') => void;
  fromName: string;
  toName: string;
}

const FlightList = ({ 
  flights, 
  direction, 
  selectedFlight, 
  onSelectFlight,
  fromName,
  toName
}: FlightListProps) => {
  const navigate = useNavigate();
  
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
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          direction={direction}
          isSelected={selectedFlight?.id === flight.id}
          onSelect={onSelectFlight}
          fromName={fromName}
          toName={toName}
        />
      ))}
    </div>
  );
};

export default FlightList;
