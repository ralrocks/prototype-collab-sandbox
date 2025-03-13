
import { Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlightTimingProps {
  departureTime: string | undefined;
  arrivalTime: string | undefined;
  duration: string | undefined;
  fromName: string;
  toName: string;
  direction: 'outbound' | 'return';
}

export const FlightTiming = ({
  departureTime,
  arrivalTime,
  duration,
  fromName,
  toName,
  direction
}: FlightTimingProps) => {
  // Format departure and arrival times
  const getFormattedTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error parsing time:', e);
      return 'N/A';
    }
  };
  
  // Check if departure and arrival dates are different
  const isDifferentDay = () => {
    if (!departureTime || !arrivalTime) return false;
    try {
      const departureDate = new Date(departureTime).toDateString();
      const arrivalDate = new Date(arrivalTime).toDateString();
      return departureDate !== arrivalDate;
    } catch (e) {
      console.error('Error comparing dates:', e);
      return false;
    }
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="text-right">
          <div className="font-medium">{getFormattedTime(departureTime)}</div>
          <div className="text-xs text-gray-500">{direction === 'outbound' ? fromName : toName}</div>
        </div>
        
        <div className="w-16 h-px bg-gray-300 relative">
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -right-1"></div>
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -left-1"></div>
        </div>
        
        <div className="text-left">
          <div className="font-medium">{getFormattedTime(arrivalTime)}</div>
          <div className="text-xs text-gray-500">{direction === 'outbound' ? toName : fromName}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
        <Clock size={14} className="mr-1" />
        {duration ? duration : "Duration unavailable"}
        
        {isDifferentDay() && (
          <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
            <Calendar size={12} className="mr-1" /> +1 day
          </Badge>
        )}
      </div>
    </div>
  );
};
