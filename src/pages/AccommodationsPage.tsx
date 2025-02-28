
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Star, Wifi, Coffee, Utensils, Dumbbell, ArrowRight, Loader2 } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchHotels } from '@/services/travelApi';
import { Hotel } from '@/types';

interface HousingOption {
  id: number;
  title: string;
  bulletPoints: string[];
  price: number;
}

const AccommodationsPage = () => {
  const navigate = useNavigate();
  const { selectedOutboundFlight, selectedHousing, setSelectedHousing } = useBookingStore();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no flight is selected
    if (!selectedOutboundFlight) {
      toast.error("Please select a flight first");
      navigate('/flights');
      return;
    }

    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const to = localStorage.getItem('toLocation') || 'JFK';
        const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
        
        // Calculate a return date (5 days after departure)
        const departureObj = new Date(departureDate);
        const returnObj = new Date(departureObj);
        returnObj.setDate(departureObj.getDate() + 5);
        const returnDate = returnObj.toISOString().split('T')[0];
        
        // Get destination city name based on airport code
        const cityMap: Record<string, string> = {
          'JFK': 'New York',
          'LAX': 'Los Angeles',
          'MIA': 'Miami',
          'ORD': 'Chicago',
          'SFO': 'San Francisco',
          // Add more mappings as needed
        };
        
        const city = cityMap[to] || 'New York';
        
        const hotelData = await fetchHotels(city, departureDate, returnDate);
        setHotels(hotelData);
        setError(null);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError('Failed to load hotel data. Please try again.');
        toast.error('Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotelData();
  }, [selectedOutboundFlight, navigate]);

  // Convert Hotel objects to HousingOption format for compatibility with existing bookingStore
  const convertToHousingOption = (hotel: Hotel): HousingOption => {
    return {
      id: hotel.id,
      title: hotel.name,
      bulletPoints: [
        `${hotel.rating}/5 stars - ${hotel.location}`,
        ...hotel.amenities
      ],
      price: hotel.price
    };
  };

  const isHousingSelected = (hotelId: number) => {
    return selectedHousing.some(h => h.id === hotelId);
  };

  const handleHousingToggle = (hotel: Hotel) => {
    const housingOption = convertToHousingOption(hotel);
    
    if (isHousingSelected(hotel.id)) {
      setSelectedHousing(selectedHousing.filter(h => h.id !== hotel.id));
      toast.info(`Removed ${hotel.name} from selection`);
    } else {
      setSelectedHousing([...selectedHousing, housingOption]);
      toast.success(`Added ${hotel.name} to selection`);
    }
  };

  const handleContinue = () => {
    if (selectedHousing.length === 0) {
      toast.error("Please select at least one accommodation!");
      return;
    }
    navigate('/checkout');
  };

  const renderAmenityIcon = (amenity: string) => {
    if (amenity.includes('WiFi')) return <Wifi size={16} className="mr-1" />;
    if (amenity.includes('Breakfast')) return <Coffee size={16} className="mr-1" />;
    if (amenity.includes('Restaurant')) return <Utensils size={16} className="mr-1" />;
    if (amenity.includes('Gym')) return <Dumbbell size={16} className="mr-1" />;
    return null;
  };

  if (loading) {
    return (
      <WebLayout title="Loading Accommodations..." showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">
            Searching for the best accommodations...
          </p>
        </div>
      </WebLayout>
    );
  }

  if (error) {
    return (
      <WebLayout title="Error" showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </WebLayout>
    );
  }

  return (
    <WebLayout title="Select Accommodations" showBackButton>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Select Your Accommodations</h2>
          <p className="text-gray-600 mb-4">
            Choose where you'll stay during your trip. You can select multiple options.
          </p>
          
          <div className="space-y-6">
            {hotels.map((hotel) => (
              <Card 
                key={hotel.id} 
                className={`hover:shadow-md transition-all ${
                  isHousingSelected(hotel.id) ? 'border-2 border-green-500' : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative overflow-hidden">
                      {hotel.image ? (
                        <img 
                          src={hotel.image} 
                          alt={hotel.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-400">No image</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 md:p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{hotel.name}</h3>
                          <div className="flex items-center">
                            <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                            <span>{hotel.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{hotel.location}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.map((amenity, idx) => (
                            <span 
                              key={idx} 
                              className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full flex items-center"
                            >
                              {renderAmenityIcon(amenity)}
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-lg font-bold">${hotel.price}</span>
                          <span className="text-gray-600 text-sm"> / night</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Checkbox
                            id={`hotel-${hotel.id}`}
                            checked={isHousingSelected(hotel.id)}
                            onCheckedChange={() => handleHousingToggle(hotel)}
                            className="mr-2"
                          />
                          <label 
                            htmlFor={`hotel-${hotel.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {isHousingSelected(hotel.id) ? 'Selected' : 'Select'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {selectedHousing.length > 0 && (
              <p className="text-gray-600">
                Selected {selectedHousing.length} accommodation{selectedHousing.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <Button
            onClick={handleContinue}
            className="px-6"
            disabled={selectedHousing.length === 0}
          >
            Continue to Checkout
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </WebLayout>
  );
};

export default AccommodationsPage;
