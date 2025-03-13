
import { ExternalLink, Plane, Calendar, Clock, Map, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface FlightDetailsProps {
  detailsLoading: boolean;
  flight: any;
  additionalDetails: any;
  openBookingLink: (e: React.MouseEvent) => void;
}

export const FlightDetails = ({ 
  detailsLoading, 
  flight, 
  additionalDetails,
  openBookingLink
}: FlightDetailsProps) => {
  if (detailsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flight Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <Plane className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Flight Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Airline</p>
            <p className="font-medium">{flight.attribute}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Flight Number</p>
            <p className="font-medium">{flight.details?.flightNumber || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Aircraft</p>
            <p className="font-medium">{flight.details?.aircraft || 'Information not available'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">On-time Performance</p>
            <p className="font-medium">{flight.details?.onTimePerformance || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Terminal Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <Map className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Terminal Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Departure Terminal</p>
            <p className="font-medium">{flight.details?.terminalInfo?.departure || 'Information not available'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Arrival Terminal</p>
            <p className="font-medium">{flight.details?.terminalInfo?.arrival || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Baggage and Policies */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <Info className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Baggage & Policies</h4>
        </div>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Baggage Allowance</p>
            <p className="font-medium">{flight.details?.baggageAllowance || 'Information not available'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Cancellation Policy</p>
            <p className="font-medium">{flight.details?.cancellationPolicy || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Amenities */}
      {flight.details?.amenities && flight.details.amenities.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {flight.details.amenities.map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional AI-generated details */}
      {additionalDetails && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
          <div className="text-sm space-y-3">
            {Object.entries(additionalDetails).map(([key, value]: [string, any]) => {
              // Skip displaying empty values or keys that are already shown
              if (!value || 
                  ['airline', 'flightNumber', 'aircraft'].includes(key.toLowerCase())) {
                return null;
              }
              
              return (
                <div key={key} className="space-y-1">
                  <p className="text-gray-500 text-xs">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="pt-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={openBookingLink}
        >
          <ExternalLink size={14} className="mr-2" /> View & Book on Airline Website
        </Button>
      </div>
    </div>
  );
};
