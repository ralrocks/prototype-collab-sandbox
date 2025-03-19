
import { ExternalLink, Building, MapPin, Star, Info, Wifi, Coffee, Utensils, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Hotel } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    if (amenity.toLowerCase().includes('restaurant')) return <Utensils size={16} className="mr-1" />;
    if (amenity.toLowerCase().includes('gym') || amenity.toLowerCase().includes('fitness')) return <Dumbbell size={16} className="mr-1" />;
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Hotel Information Section */}
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
      
      {/* Location Section */}
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
          {additionalDetails?.publicTransport && (
            <div className="space-y-1 mt-2">
              <p className="text-gray-500 text-xs">Public Transport</p>
              <p className="text-gray-700">{additionalDetails.publicTransport}</p>
            </div>
          )}
          {additionalDetails?.parking && (
            <div className="space-y-1 mt-2">
              <p className="text-gray-500 text-xs">Parking</p>
              <p className="text-gray-700">{additionalDetails.parking}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Amenities Section */}
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
        
        {additionalDetails?.internetAccess && (
          <div className="space-y-1 mt-4">
            <p className="text-gray-500 text-xs">Internet Access</p>
            <p className="text-gray-700">{additionalDetails.internetAccess}</p>
          </div>
        )}
        
        {additionalDetails?.breakfastDetails && (
          <div className="space-y-1 mt-2">
            <p className="text-gray-500 text-xs">Breakfast</p>
            <p className="text-gray-700">{additionalDetails.breakfastDetails}</p>
          </div>
        )}
      </div>
      
      {/* Policies Section */}
      {(additionalDetails?.policies || additionalDetails?.checkIn || additionalDetails?.checkOut) && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <Info className="text-blue-500 mr-2" size={18} />
            <h4 className="font-semibold text-gray-800">Policies & Check-in</h4>
          </div>
          <div className="space-y-3 text-sm">
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
            {additionalDetails.policies && (
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Policies</p>
                <p className="font-medium">{additionalDetails.policies}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Nearby Attractions */}
      {additionalDetails?.nearbyAttractions && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <MapPin className="text-blue-500 mr-2" size={18} />
            <h4 className="font-semibold text-gray-800">Nearby Attractions</h4>
          </div>
          <p className="text-sm">{additionalDetails.nearbyAttractions}</p>
        </div>
      )}
      
      {/* Room Types */}
      {additionalDetails?.roomTypes && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Room Types</h4>
          <p className="text-sm">{additionalDetails.roomTypes}</p>
        </div>
      )}
      
      {/* Special Features */}
      {additionalDetails?.specialFeatures && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Special Features</h4>
          <p className="text-sm">{additionalDetails.specialFeatures}</p>
        </div>
      )}
      
      {/* Website Link */}
      {openBookingLink && (
        <div className="pt-4">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            onClick={openBookingLink}
          >
            <ExternalLink size={14} className="mr-2" /> Visit Hotel Website
          </Button>
        </div>
      )}
    </div>
  );
};
