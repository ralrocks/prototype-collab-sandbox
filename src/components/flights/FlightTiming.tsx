
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

  // Format duration for display
  const formatDuration = (durationStr?: string) => {
    if (!durationStr) return "Duration unavailable";
    
    if (durationStr.startsWith('PT')) {
      // Handle ISO 8601 duration format (PT3H30M)
      const hours = durationStr.match(/(\d+)H/);
      const minutes = durationStr.match(/(\d+)M/);
      
      return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`.trim();
    }
    
    return durationStr;
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-6">
        <div className="text-right">
          <div className="font-semibold text-lg text-blue-700">{getFormattedTime(departureTime)}</div>
          <div className="text-xs font-medium text-gray-500">{direction === 'outbound' ? fromName : toName}</div>
        </div>
        
        <div className="relative w-20 mx-1">
          <div className="h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 w-full absolute top-1/2 transform -translate-y-1/2"></div>
          <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-1/2 -translate-y-1/2 -left-1"></div>
          <div className="absolute w-2 h-2 bg-indigo-500 rounded-full top-1/2 -translate-y-1/2 -right-1"></div>
        </div>
        
        <div className="text-left">
          <div className="font-semibold text-lg text-indigo-700">{getFormattedTime(arrivalTime)}</div>
          <div className="text-xs font-medium text-gray-500">{direction === 'outbound' ? toName : fromName}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-3 text-sm">
        <Clock size={14} className="mr-1.5 text-blue-500" />
        <span className="font-medium text-gray-700">{formatDuration(duration)}</span>
        
        {isDifferentDay() && (
          <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
            <Calendar size={12} className="mr-1" /> +1 day
          </Badge>
        )}
      </div>
    </div>
  );
};
