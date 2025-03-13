
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="space-y-4">
      {/* Flight Information */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Flight Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Airline:</p>
            <p>{flight.attribute}</p>
          </div>
          <div>
            <p className="text-gray-500">Flight Number:</p>
            <p>{flight.details?.flightNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Aircraft:</p>
            <p>{flight.details?.aircraft || 'Information not available'}</p>
          </div>
          <div>
            <p className="text-gray-500">On-time Performance:</p>
            <p>{flight.details?.onTimePerformance || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Terminal Information */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Terminal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Departure Terminal:</p>
            <p>{flight.details?.terminalInfo?.departure || 'Information not available'}</p>
          </div>
          <div>
            <p className="text-gray-500">Arrival Terminal:</p>
            <p>{flight.details?.terminalInfo?.arrival || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Baggage and Policies */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Baggage & Policies</h4>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-500">Baggage Allowance:</p>
            <p>{flight.details?.baggageAllowance || 'Information not available'}</p>
          </div>
          <div>
            <p className="text-gray-500">Cancellation Policy:</p>
            <p>{flight.details?.cancellationPolicy || 'Information not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Amenities */}
      {flight.details?.amenities && flight.details.amenities.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {flight.details.amenities.map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Additional AI-generated details */}
      {additionalDetails && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Additional Information</h4>
          <div className="text-sm space-y-2">
            {Object.entries(additionalDetails).map(([key, value]: [string, any]) => {
              // Skip displaying empty values or keys that are already shown
              if (!value || 
                  ['airline', 'flightNumber', 'aircraft'].includes(key.toLowerCase())) {
                return null;
              }
              
              return (
                <div key={key}>
                  <p className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</p>
                  <p>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={openBookingLink}
        >
          <ExternalLink size={14} className="mr-1" /> View & Book on Airline Website
        </Button>
      </div>
    </div>
  );
};
