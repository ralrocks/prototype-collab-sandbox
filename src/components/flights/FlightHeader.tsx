
import { Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FlightHeaderProps {
  airline?: string;
  flightNumber?: string;
  fromName?: string;
  toName?: string;
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  sortBy?: 'price' | 'time';
  setSortBy?: (value: 'price' | 'time') => void;
}

export const FlightHeader = ({ 
  airline, 
  flightNumber,
  fromName,
  toName,
  departureDate,
  returnDate,
  sortBy,
  setSortBy
}: FlightHeaderProps) => {
  // If this is the airline header in a card
  if (airline) {
    return (
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 shadow-md">
          <Plane className="text-white" size={24} />
        </div>
        <div>
          <h3 className="font-medium text-gray-800">{airline}</h3>
          <p className="text-sm text-gray-500">
            {flightNumber || "Flight number unavailable"}
          </p>
        </div>
      </div>
    );
  }
  
  // If this is the route header with sorting
  return (
    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
        <h2 className="text-xl font-bold mb-1">Flight Details</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {fromName}
          </Badge>
          <span>→</span>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {toName}
          </Badge>
          {returnDate && (
            <>
              <span className="mx-1">•</span>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                Return
              </Badge>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-sm text-gray-500">Departure Date</p>
          <p className="font-medium">{departureDate}</p>
          {returnDate && (
            <>
              <p className="text-sm text-gray-500 mt-2">Return Date</p>
              <p className="font-medium">{returnDate}</p>
            </>
          )}
        </div>
        
        {sortBy && setSortBy && (
          <div className="min-w-36">
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as 'price' | 'time')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Sort by Price</SelectItem>
                <SelectItem value="time">Sort by Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
