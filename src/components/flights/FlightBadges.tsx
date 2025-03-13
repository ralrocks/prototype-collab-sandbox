
import { Info, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/services/travelApi';

interface FlightBadgesProps {
  departureTime: string | undefined;
  arrivalTime: string | undefined;
  cabin: string | undefined;
  stops: number | undefined;
  aircraft: string | undefined;
}

export const FlightBadges = ({ 
  departureTime, 
  arrivalTime, 
  cabin, 
  stops, 
  aircraft 
}: FlightBadgesProps) => {
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

  return (
    <div className="border-t px-4 md:px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
      <Badge variant="outline" className="bg-white">
        <Clock size={14} className="mr-1" /> 
        {getFormattedTime(departureTime)} - {getFormattedTime(arrivalTime)}
      </Badge>
      
      {cabin && (
        <Badge variant="outline" className="bg-white">
          {cabin}
        </Badge>
      )}
      
      {stops !== undefined && (
        <Badge variant="outline" className={`bg-white ${stops > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
        </Badge>
      )}
      
      {aircraft && (
        <Badge variant="outline" className="bg-white">
          <Info size={14} className="mr-1" /> {aircraft}
        </Badge>
      )}
      
      {getFormattedDate(departureTime) && (
        <Badge variant="outline" className="bg-white">
          <Calendar size={14} className="mr-1" /> 
          {getFormattedDate(departureTime)}
        </Badge>
      )}
    </div>
  );
};
