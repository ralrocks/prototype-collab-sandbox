
import { MapPin, Calendar, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightHeaderProps {
  isRoundTrip: boolean;
  fromName: string;
  toName: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  sortBy: 'price' | 'time';
  setSortBy: (sort: 'price' | 'time') => void;
}

const FlightHeader = ({ 
  isRoundTrip,
  fromName, 
  toName, 
  from, 
  to, 
  departureDate, 
  returnDate,
  sortBy, 
  setSortBy 
}: FlightHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 md:mb-0">
            <div className="flex items-center">
              <MapPin size={18} className="text-blue-500 mr-2" />
              <span className="font-medium">{fromName || 'Departure'}</span>
              {from && <span className="text-gray-500 mx-2">({from})</span>}
            </div>
            
            <div className="hidden md:block">
              <ArrowRight size={18} className="text-gray-400" />
            </div>
            
            <div className="flex items-center mt-2 md:mt-0">
              <MapPin size={18} className="text-blue-500 mr-2" />
              <span className="font-medium">{toName || 'Destination'}</span>
              {to && <span className="text-gray-500 mx-2">({to})</span>}
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="flex items-center mb-2">
              <Calendar size={18} className="text-blue-500 mr-2" />
              <span className="text-gray-700">{departureDate}</span>
            </div>
            
            {isRoundTrip && returnDate && (
              <div className="flex items-center">
                <Calendar size={18} className="text-blue-500 mr-2" />
                <span className="text-gray-700">{returnDate}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-500">
              {isRoundTrip ? 'Round-trip' : 'One-way'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={sortBy === 'price' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setSortBy('price')}
              className="text-xs"
            >
              <DollarSign size={14} className="mr-1" />
              Price
            </Button>
            <Button 
              variant={sortBy === 'time' ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => setSortBy('time')}
              className="text-xs"
            >
              <Clock size={14} className="mr-1" />
              Departure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightHeader;
