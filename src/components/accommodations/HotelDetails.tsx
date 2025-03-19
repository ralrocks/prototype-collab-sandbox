
import { ExternalLink, Building, MapPin, Star, Info, Wifi, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Hotel } from '@/types';

interface HotelDetailsProps {
  detailsLoading: boolean;
  hotel: Hotel;
  additionalDetails: any;
  openBookingLink?: (e: React.MouseEvent) => void;
}

export const HotelDetails = ({ 
  detailsLoading, 
  hotel, 
  additionalDetails,
  openBookingLink
}: HotelDetailsProps) => {
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

  const renderAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi size={16} className="mr-1" />;
    if (amenity.toLowerCase().includes('breakfast')) return <Coffee size={16} className="mr-1" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Hotel Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <Building className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Hotel Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Hotel Name</p>
            <p className="font-medium">{hotel.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Rating</p>
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-yellow-400 h-4 w-4 mr-1" />
              <span className="font-medium">{hotel.rating} / 5</span>
            </div>
          </div>
          {hotel.brand && (
            <div className="space-y-1">
              <p className="text-gray-500 text-xs">Brand</p>
              <p className="font-medium">{hotel.brand}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-gray-500 text-xs">Price Per Night</p>
            <p className="font-medium">${hotel.price}</p>
          </div>
        </div>
      </div>
      
      {/* Location Information */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <MapPin className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Location</h4>
        </div>
        <div className="space-y-3 text-sm">
          <p>{hotel.location}</p>
          {additionalDetails?.locationDetails && (
            <p className="text-gray-700">{additionalDetails.locationDetails}</p>
          )}
        </div>
      </div>
      
      {/* Amenities */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-3">
          <Info className="text-blue-500 mr-2" size={18} />
          <h4 className="font-semibold text-gray-800">Amenities</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotel.amenities.map((amenity, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
              {renderAmenityIcon(amenity)}
              {amenity}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Policies & Rules */}
      {(additionalDetails?.policies || additionalDetails?.rules) && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Policies & Rules</h4>
          <div className="space-y-3 text-sm">
            {additionalDetails.policies && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Policies</p>
                <p className="font-medium">{additionalDetails.policies}</p>
              </div>
            )}
            {additionalDetails.checkIn && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Check-in</p>
                <p className="font-medium">{additionalDetails.checkIn}</p>
              </div>
            )}
            {additionalDetails.checkOut && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Check-out</p>
                <p className="font-medium">{additionalDetails.checkOut}</p>
              </div>
            )}
            {additionalDetails.rules && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">House Rules</p>
                <p className="font-medium">{additionalDetails.rules}</p>
              </div>
            )}
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
                  ['name', 'rating', 'brand', 'price', 'location', 'locationDetails', 'policies', 'checkIn', 'checkOut', 'rules'].includes(key.toLowerCase())) {
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
      
      {openBookingLink && (
        <div className="pt-2">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            onClick={openBookingLink}
          >
            <ExternalLink size={14} className="mr-2" /> Book on Hotel Website
          </Button>
        </div>
      )}
    </div>
  );
};
