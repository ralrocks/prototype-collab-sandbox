
import { Calendar, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FlightHeaderProps {
  isRoundTrip: boolean;
  fromName: string;
  toName: string;
  from: string;
  to: string;
  departureDate: string;
  sortBy: 'price' | 'time';
  setSortBy: (value: 'price' | 'time') => void;
}

const FlightHeader = ({
  isRoundTrip,
  fromName,
  toName,
  from,
  to,
  departureDate,
  sortBy,
  setSortBy
}: FlightHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Select Your {isRoundTrip ? 'Flights' : 'Flight'}</h2>
          {isRoundTrip ? (
            <div className="flex items-center text-gray-600 mb-2">
              <Badge variant="outline" className="mr-2 bg-blue-50">Round Trip</Badge>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              {fromName} ({from}) ↔ {toName} ({to})
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <p className="text-gray-600 flex items-center">
                <Calendar className="mr-2" size={16} />
                Departing {departureDate}
              </p>
              <p className="text-gray-600 text-sm">
                {fromName} ({from}) to {toName} ({to})
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant={sortBy === 'price' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('price')}
          >
            Sort by Price
          </Button>
          <Button 
            variant={sortBy === 'time' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('time')}
          >
            Sort by Time
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightHeader;
