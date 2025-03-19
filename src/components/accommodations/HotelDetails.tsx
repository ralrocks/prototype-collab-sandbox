
import { ExternalLink, MapPin, Clock, Wifi, Coffee, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger
} from '@/components/ui/accordion';

interface HotelDetailsProps {
  hotel: any;
  detailsLoading: boolean;
}

export const HotelDetails = ({ hotel, detailsLoading }: HotelDetailsProps) => {
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

  // Generate a booking link
  const generateBookingLink = () => {
    const hotelName = encodeURIComponent(hotel.name);
    const location = encodeURIComponent(hotel.location);
    
    if (hotel.bookingLink) return hotel.bookingLink;
    
    // Determine if it's a known hotel chain to direct to their website
    const knownChains = {
      'Marriott': 'https://www.marriott.com/search/default.mi?searchTerm=',
      'Hilton': 'https://www.hilton.com/en/search/?query=',
      'Hyatt': 'https://www.hyatt.com/search/',
      'InterContinental': 'https://www.ihg.com/intercontinental/hotels/us/en/find-hotels/hotel/list?qDest=',
      'Holiday Inn': 'https://www.ihg.com/holidayinn/hotels/us/en/find-hotels/hotel/list?qDest=',
      'Sheraton': 'https://www.marriott.com/search/default.mi?brand=SH&searchTerm=',
      'Westin': 'https://www.marriott.com/search/default.mi?brand=WI&searchTerm=',
      'Radisson': 'https://www.radissonhotels.com/en-us/search?searchType=new&city=',
      'Four Seasons': 'https://www.fourseasons.com/find-a-hotel-or-resort/?query=',
      'Ritz-Carlton': 'https://www.ritzcarlton.com/en/hotels/find-hotels?search=',
      'Best Western': 'https://www.bestwestern.com/en_US/hotels?searching=true&filter=keyword&keyword=',
      'Wyndham': 'https://www.wyndhamhotels.com/search?search=',
      'Choice Hotels': 'https://www.choicehotels.com/search?q=',
      'Accor': 'https://all.accor.com/search/hotel-search.en.shtml?autocomplete=',
      'Crowne Plaza': 'https://www.ihg.com/crowneplaza/hotels/us/en/find-hotels/hotel/list?qDest=',
      'DoubleTree': 'https://www.hilton.com/en/doubletree/search/?query=',
      'Hampton': 'https://www.hilton.com/en/hampton/search/?query=',
      'Embassy Suites': 'https://www.hilton.com/en/embassy/search/?query=',
      'Comfort Inn': 'https://www.choicehotels.com/comfort-inn/search?q='
    };
    
    // Check if the hotel name includes any known chain
    for (const [chain, url] of Object.entries(knownChains)) {
      if (hotel.name.toLowerCase().includes(chain.toLowerCase())) {
        return `${url}${hotelName}+${location}`;
      }
    }
    
    // Default to a Google search for the hotel
    return `https://www.google.com/search?q=${hotelName}+${location}+hotel`;
  };

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="property-details">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center">
              <Info className="text-blue-500 mr-2" size={18} />
              Property Details
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Location</p>
                <p className="font-medium">{hotel.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-xs">Rating</p>
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span>{hotel.rating}/5</span>
                </div>
              </div>
              {hotel.description && (
                <div className="space-y-1 col-span-full">
                  <p className="text-gray-500 text-xs">Description</p>
                  <p className="font-medium">{hotel.description}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="amenities">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center">
              <Wifi className="text-blue-500 mr-2" size={18} />
              Amenities & Services
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {amenity}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="policies">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex items-center">
              <Clock className="text-blue-500 mr-2" size={18} />
              Policies & Additional Info
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              {hotel.policies?.cancellation && (
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Cancellation Policy</p>
                  <p className="font-medium">{hotel.policies.cancellation}</p>
                </div>
              )}
              {hotel.policies?.checkIn && (
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Check-in Time</p>
                  <p className="font-medium">{hotel.policies.checkIn}</p>
                </div>
              )}
              {hotel.policies?.checkOut && (
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs">Check-out Time</p>
                  <p className="font-medium">{hotel.policies.checkOut}</p>
                </div>
              )}
              {!hotel.policies && (
                <p className="text-gray-600">Standard hotel policies apply. Please check with the hotel directly for specific details.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="pt-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.open(generateBookingLink(), '_blank')}
        >
          <ExternalLink size={14} className="mr-2" /> View & Book on Hotel Website
        </Button>
      </div>
    </div>
  );
};
