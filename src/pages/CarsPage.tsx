
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Car, MapPin, Calendar, ArrowRight, DollarSign, Filter } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CarRental } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { fetchCarRentals } from '@/services/travelApi';
import { Input } from '@/components/ui/input';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from 'date-fns';

// Component to display a car rental card
const CarRentalCard = ({ 
  rental, 
  selected, 
  onSelect 
}: { 
  rental: CarRental; 
  selected: boolean; 
  onSelect: () => void 
}) => {
  return (
    <div 
      className={`relative border rounded-lg overflow-hidden transition-all ${selected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
      onClick={onSelect}
    >
      <div className="absolute top-2 right-2 z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-blue-500 border-white' : 'border-gray-300 bg-white'}`}>
          {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <img 
            src={rental.image} 
            alt={`${rental.company} - ${rental.carType}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 md:hidden">
            <span className="text-white font-semibold">{rental.company}</span>
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <div className="md:flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg hidden md:block">{rental.company}</h3>
              <p className="text-gray-700 font-medium">{rental.carType}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {rental.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="font-bold text-2xl text-blue-600">${rental.pricePerDay}</p>
              <p className="text-sm text-gray-500">per day</p>
              <p className="font-semibold mt-1">${rental.totalPrice} total</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center">
                <MapPin size={14} className="mr-1" />
                Pickup:
              </span>
              <span>{rental.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center">
                <MapPin size={14} className="mr-1" />
                Dropoff:
              </span>
              <span>{rental.dropoffLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Availability:</span>
              <span className={rental.availability === 'Available' ? 'text-green-600' : 'text-amber-600'}>
                {rental.availability}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CarsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.state || {};
  
  const [rentals, setRentals] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRental, setSelectedRental] = useState<CarRental | null>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedCarTypes, setSelectedCarTypes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Car types and features for filtering
  const carTypes = ['Economy', 'Compact', 'Mid-size', 'Standard', 'Full-size', 'Premium', 'Luxury', 'SUV', 'Minivan', 'Convertible'];
  const features = ['Automatic Transmission', 'Air Conditioning', 'Bluetooth', 'Cruise Control', 'GPS Navigation', 'USB Charging', 'Backup Camera'];
  
  // Get location and date from search params or localStorage
  const destination = searchParams.to || localStorage.getItem('toLocation') || 'New York';
  const destinationName = searchParams.toName || localStorage.getItem('toLocationName') || destination;
  const pickupDate = searchParams.departDate || localStorage.getItem('departureDate') || new Date().toISOString();
  const returnDate = searchParams.returnDate || localStorage.getItem('returnDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Format dates for display
  const formattedPickupDate = format(new Date(pickupDate), 'MMM dd, yyyy');
  const formattedReturnDate = format(new Date(returnDate), 'MMM dd, yyyy');
  
  useEffect(() => {
    fetchCarRentalData();
  }, []);
  
  // Function to fetch car rental data
  const fetchCarRentalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        carType: selectedCarTypes.length === 1 ? selectedCarTypes[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 200 ? priceRange[1] : undefined,
        features: selectedFeatures.length > 0 ? selectedFeatures : undefined
      };
      
      const rentalData = await fetchCarRentals(destinationName, pickupDate, returnDate, filters);
      setRentals(rentalData);
    } catch (err: any) {
      console.error('Error fetching car rentals:', err);
      setError('Failed to load car rental data. Please try again.');
      toast.error('Failed to load car rentals');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const applyFilters = () => {
    fetchCarRentalData();
  };
  
  // Toggle car type selection
  const toggleCarType = (carType: string) => {
    setSelectedCarTypes(prev => 
      prev.includes(carType) 
        ? prev.filter(t => t !== carType) 
        : [...prev, carType]
    );
  };
  
  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };
  
  // Handle continue button click
  const handleContinue = () => {
    if (!selectedRental) {
      toast.error("Please select a car rental option!");
      return;
    }
    
    // Here you would typically save the selection and navigate to checkout
    localStorage.setItem('selectedCarRental', JSON.stringify(selectedRental));
    toast.success(`Selected ${selectedRental.carType} from ${selectedRental.company}`);
    navigate('/checkout');
  };
  
  return (
    <AuthGuard>
      <WebLayout title={`Car Rentals in ${destinationName}`} showBackButton>
        <div className="max-w-4xl mx-auto">
          {/* Header with search details */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center text-lg font-semibold">
                  <Car size={20} className="text-blue-500 mr-2" />
                  <span>Car Rentals in {destinationName}</span>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end">
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="text-blue-500 mr-2" />
                  <span className="text-gray-700">Pickup: {formattedPickupDate}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={18} className="text-blue-500 mr-2" />
                  <span className="text-gray-700">Return: {formattedReturnDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => navigate('/search')}
              >
                Modify Search
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Car Rentals</SheetTitle>
                    <SheetDescription>
                      Customize your car rental search with these filters.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Price Range Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Price Range (per day)</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0, 200]}
                          max={200}
                          step={5}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Car Type Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Car Type</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {carTypes.map((carType) => (
                          <div key={carType} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`car-type-${carType}`} 
                              checked={selectedCarTypes.includes(carType)}
                              onCheckedChange={() => toggleCarType(carType)}
                            />
                            <Label htmlFor={`car-type-${carType}`} className="text-sm">
                              {carType}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Features Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Features</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`feature-${feature}`} 
                              checked={selectedFeatures.includes(feature)}
                              onCheckedChange={() => toggleFeature(feature)}
                            />
                            <Label htmlFor={`feature-${feature}`} className="text-sm">
                              {feature}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={applyFilters} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Car rental list */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200"></div>
                    <div className="p-4 flex-1 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
              <div className="text-red-500 font-medium mb-2">{error}</div>
              <Button onClick={fetchCarRentalData}>Try Again</Button>
            </div>
          ) : rentals.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-6 text-center">
              <div className="text-amber-500 font-medium mb-2">No car rentals found with the current filters.</div>
              <Button onClick={() => {
                setPriceRange([0, 200]);
                setSelectedCarTypes([]);
                setSelectedFeatures([]);
                fetchCarRentalData();
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {rentals.map((rental) => (
                <CarRentalCard
                  key={rental.id}
                  rental={rental}
                  selected={selectedRental?.id === rental.id}
                  onSelect={() => setSelectedRental(rental)}
                />
              ))}
            </div>
          )}
          
          {/* Continue button */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/search')}
              className="flex items-center gap-2"
            >
              Back to Search
            </Button>
            
            <Button
              onClick={handleContinue}
              className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={!selectedRental}
            >
              Continue to Checkout
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default CarsPage;
