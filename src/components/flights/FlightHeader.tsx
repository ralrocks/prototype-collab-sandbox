
import { Plane } from 'lucide-react';

interface FlightHeaderProps {
  airline: string;
  flightNumber: string | undefined;
}

export const FlightHeader = ({ airline, flightNumber }: FlightHeaderProps) => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
        <Plane className="text-blue-600" size={24} />
      </div>
      <div>
        <h3 className="font-medium">{airline}</h3>
        <p className="text-sm text-gray-500">
          {flightNumber || "Flight number unavailable"}
        </p>
      </div>
    </div>
  );
};
