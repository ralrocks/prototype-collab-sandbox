
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Star, Wifi, Coffee, Utensils, Dumbbell, ArrowRight, Loader2, Filter, ArrowLeft, ExternalLink, X } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchHotels } from '@/services/travelApi';
import { getHotelDetails } from '@/services/hotelDetailService';
import { Hotel } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HotelDetails } from '@/components/accommodations/HotelDetails';
import HotelsLoading from '@/components/accommodations/HotelsLoading';

interface HousingOption {
  id: number;
  title: string;
  bulletPoints: string[];
  price: number;
}

const AccommodationsPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    selectedReturnFlight,
    selectedHousing, 
    setSelectedHousing,
    isRoundTrip,
    skipHotels
  } = useBookingStore();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Hotel details states
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<Hotel | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState<any>(null);

  const amenitiesList = [
    "Free WiFi", "Pool", "Spa", "Restaurant", "Gym", "Breakfast", "Bar", "Parking"
  ];

  useEffect(() => {
    // Redirect if hotels should be skipped
    if (skipHotels) {
      navigate('/checkout');
      return;
    }
    
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
        const toName = localStorage.getItem('toLocationName') || 'New York';
        const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
        
        // Calculate a return date based on user selection or default to 5 days
        let returnDate;
        if (isRoundTrip && localStorage.getItem('returnDate')) {
          returnDate = localStorage.getItem('returnDate');
        } else {
          const departureObj = new Date(departureDate);
          const returnObj = new Date(departureObj);
          returnObj.setDate(departureObj.getDate() + 5);
          returnDate = returnObj.toISOString().split('T')[0];
        }
        
        // Define filters
        const filters = {
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          minRating: minRating,
          amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined
        };
        
        const hotelData = await fetchHotels(toName, departureDate, returnDate || '', filters);
        setHotels(hotelData);
        setFilteredHotels(hotelData);
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
  }, [selectedOutboundFlight, navigate, priceRange, minRating, selectedAmenities, isRoundTrip, skipHotels]);

  // Load hotel details when a hotel is selected for viewing
  useEffect(() => {
    if (selectedHotelForDetails && detailsOpen) {
      const loadHotelDetails = async () => {
        setDetailsLoading(true);
        try {
          const details = await getHotelDetails(selectedHotelForDetails);
          setAdditionalDetails(details);
        } catch (error) {
          console.error('Error loading hotel details:', error);
          toast.error('Failed to load detailed hotel information');
        } finally {
          setDetailsLoading(false);
        }
      };
      
      loadHotelDetails();
    }
  }, [selectedHotelForDetails, detailsOpen]);

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

  const handleSkipHotels = () => {
    setSelectedHousing([]);
    navigate('/checkout');
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleViewDetails = (hotel: Hotel) => {
    setSelectedHotelForDetails(hotel);
    setDetailsOpen(true);
  };

  const renderAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi size={16} className="mr-1" />;
    if (amenity.toLowerCase().includes('breakfast')) return <Coffee size={16} className="mr-1" />;
    if (amenity.toLowerCase().includes('restaurant')) return <Utensils size={16} className="mr-1" />;
    if (amenity.toLowerCase().includes('gym')) return <Dumbbell size={16} className="mr-1" />;
    return null;
  };

  const openBookingLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedHotelForDetails) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedHotelForDetails.name + ' ' + selectedHotelForDetails.location)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <WebLayout title="Loading Accommodations..." showBackButton>
        <HotelsLoading />
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Select Your Accommodations</h2>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium">Filter Options</h3>
                  
                  <div className="space-y-2">
                    <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      defaultValue={[0, 500]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Minimum Rating: {minRating} ★</Label>
                    <Slider
                      defaultValue={[0]}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="block mb-2">Amenities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => handleAmenityToggle(amenity)}
                          />
                          <label 
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm"
                          >
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Alert className="mb-4">
            <AlertTitle>Hotel accommodation is optional</AlertTitle>
            <AlertDescription>
              You can select one or more hotels, or skip this step entirely if you have other accommodation arrangements.
            </AlertDescription>
          </Alert>
          
          <p className="text-gray-600 mb-4">
            Choose where you'll stay during your trip. You can select multiple options.
          </p>
          
          <div className="space-y-6">
            {filteredHotels.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hotels match your filter criteria. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredHotels.map((hotel) => (
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
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1.5"
                              onClick={() => handleViewDetails(hotel)}
                            >
                              <ExternalLink size={14} /> Details
                            </Button>
                            
                            <Button
                              variant={isHousingSelected(hotel.id) ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleHousingToggle(hotel)}
                              className={isHousingSelected(hotel.id) 
                                ? "border-green-500 text-green-700" 
                                : "bg-blue-600"}
                            >
                              {isHousingSelected(hotel.id) ? (
                                <>
                                  <Check size={14} className="mr-1.5" /> Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/flights')}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Flights
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkipHotels}
            >
              Skip and Continue to Checkout
            </Button>
            
            <Button
              onClick={handleContinue}
              className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={selectedHousing.length === 0}
            >
              Continue to Checkout
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hotel Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{selectedHotelForDetails?.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setDetailsOpen(false)}
              >
                <X size={16} />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedHotelForDetails && (
            <HotelDetails
              detailsLoading={detailsLoading}
              hotel={selectedHotelForDetails}
              additionalDetails={additionalDetails}
              openBookingLink={openBookingLink}
            />
          )}
        </DialogContent>
      </Dialog>
    </WebLayout>
  );
};

export default AccommodationsPage;
