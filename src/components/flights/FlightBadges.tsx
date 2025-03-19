
import { Info, Clock, Calendar, Plane } from 'lucide-react';
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
    <div className="border-t px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 flex flex-wrap gap-3">
      <Badge variant="outline" className="bg-white shadow-sm hover:bg-blue-50 transition-colors">
        <Clock size={14} className="mr-1.5 text-blue-500" /> 
        {getFormattedTime(departureTime)} - {getFormattedTime(arrivalTime)}
      </Badge>
      
      {cabin && (
        <Badge variant="outline" className="bg-white shadow-sm hover:bg-blue-50 transition-colors">
          <Plane size={14} className="mr-1.5 text-blue-500" /> 
          {cabin.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )}
      
      {stops !== undefined && (
        <Badge 
          variant="outline" 
          className={`shadow-sm transition-colors ${
            stops === 0 
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
        </Badge>
      )}
      
      {aircraft && (
        <Badge variant="outline" className="bg-white shadow-sm hover:bg-blue-50 transition-colors">
          <Info size={14} className="mr-1.5 text-blue-500" /> {aircraft}
        </Badge>
      )}
      
      {getFormattedDate(departureTime) && (
        <Badge variant="outline" className="bg-white shadow-sm hover:bg-blue-50 transition-colors">
          <Calendar size={14} className="mr-1.5 text-blue-500" /> 
          {getFormattedDate(departureTime)}
        </Badge>
      )}
    </div>
  );
};
