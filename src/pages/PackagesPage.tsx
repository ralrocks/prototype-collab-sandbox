
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Star, 
  Filter, 
  ExternalLink,
  Tag,
  Search
} from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { TravelPackage } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { fetchTravelPackages } from '@/services/travelApi';
import { ComboboxDestination } from '@/components/ComboboxDestination';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from 'date-fns';

// Component to display a travel package card
const PackageCard = ({ 
  pkg 
}: { 
  pkg: TravelPackage
}) => {
  return (
    <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col">
        <div className="relative h-48">
          <img 
            src={pkg.image} 
            alt={pkg.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
            {pkg.rating.toFixed(1)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="text-white font-semibold">{pkg.agency}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg">{pkg.name}</h3>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Tag className="w-4 h-4 mr-1" />
            <span>{pkg.packageType}</span>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {pkg.inclusions.slice(0, 4).map((inclusion, idx) => (
              <span key={idx} className="inline-block bg-blue-50 rounded-full px-2 py-1 text-xs font-medium text-blue-700">
                {inclusion}
              </span>
            ))}
            {pkg.inclusions.length > 4 && (
              <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                +{pkg.inclusions.length - 4} more
              </span>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-2xl text-blue-600">${pkg.totalPrice}</p>
              <p className="text-sm text-gray-500">${pkg.pricePerPerson} per person</p>
            </div>
            
            <a 
              href={pkg.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              View Deal
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{format(new Date(pkg.departureDate), 'MMM dd')} - {format(new Date(pkg.returnDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{pkg.destination}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PackagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = location.state || {};
  
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPackageTypes, setSelectedPackageTypes] = useState<string[]>([]);
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);
  
  // Package types and inclusions for filtering
  const packageTypes = ['All Inclusive', 'Flight + Hotel', 'Flight + Hotel + Car', 'Cruise', 'Tour', 'Adventure', 'Luxury', 'Family', 'Romantic', 'Beach'];
  const inclusions = ['Flight', 'Hotel', 'Car Rental', 'Breakfast', 'All Meals', 'Airport Transfer', 'Guided Tours', 'Activities', 'Travel Insurance', 'WiFi'];
  
  // Get destination and dates from search params or localStorage
  const [destination, setDestination] = useState(searchParams.to || localStorage.getItem('toLocationName') || 'New York');
  const [destinationCode, setDestinationCode] = useState(searchParams.toCode || localStorage.getItem('toLocation') || 'NYC');
  const departureDate = searchParams.departDate || localStorage.getItem('departureDate') || new Date().toISOString();
  const returnDate = searchParams.returnDate || localStorage.getItem('returnDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Format dates for display
  const formattedDepartureDate = format(new Date(departureDate), 'MMM dd, yyyy');
  const formattedReturnDate = format(new Date(returnDate), 'MMM dd, yyyy');
  
  useEffect(() => {
    fetchPackageData();
  }, [destination]);
  
  // Function to fetch package data
  const fetchPackageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        packageType: selectedPackageTypes.length === 1 ? selectedPackageTypes[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 3000 ? priceRange[1] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        inclusions: selectedInclusions.length > 0 ? selectedInclusions : undefined
      };
      
      const packageData = await fetchTravelPackages(destination, departureDate, returnDate, filters);
      setPackages(packageData);
    } catch (err: any) {
      console.error('Error fetching travel packages:', err);
      setError('Failed to load travel package data. Please try again.');
      toast.error('Failed to load travel packages');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const applyFilters = () => {
    fetchPackageData();
  };
  
  // Handle destination selection
  const handleDestinationSelect = (value: { code: string; name: string }) => {
    setDestination(value.name);
    setDestinationCode(value.code);
    localStorage.setItem('toLocationName', value.name);
    localStorage.setItem('toLocation', value.code);
  };
  
  // Toggle package type selection
  const togglePackageType = (packageType: string) => {
    setSelectedPackageTypes(prev => 
      prev.includes(packageType) 
        ? prev.filter(t => t !== packageType) 
        : [...prev, packageType]
    );
  };
  
  // Toggle inclusion selection
  const toggleInclusion = (inclusion: string) => {
    setSelectedInclusions(prev => 
      prev.includes(inclusion) 
        ? prev.filter(i => i !== inclusion) 
        : [...prev, inclusion]
    );
  };
  
  return (
    <AuthGuard>
      <WebLayout title={`Travel Packages to ${destination}`} showBackButton>
        <div className="max-w-5xl mx-auto">
          {/* Search header */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Destination</label>
                <ComboboxDestination 
                  placeholder="Where do you want to go?"
                  onSelect={handleDestinationSelect}
                  selectedValue={destination}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium mb-1">Departure</label>
                  <div className="border rounded-md px-3 py-2 flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    {formattedDepartureDate}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Return</label>
                  <div className="border rounded-md px-3 py-2 flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    {formattedReturnDate}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={fetchPackageData}
                className="h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="hidden lg:block w-64 bg-white p-4 rounded-lg shadow-sm self-start sticky top-4">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 3000]}
                    max={3000}
                    step={50}
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
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Minimum Rating</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0]}
                    max={5}
                    step={0.5}
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{minRating.toFixed(1)}</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                      5.0
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Package Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Package Type</h4>
                <div className="space-y-2">
                  {packageTypes.map((packageType) => (
                    <div key={packageType} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`package-type-${packageType}`} 
                        checked={selectedPackageTypes.includes(packageType)}
                        onCheckedChange={() => togglePackageType(packageType)}
                      />
                      <Label htmlFor={`package-type-${packageType}`} className="text-sm">
                        {packageType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Inclusions Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Inclusions</h4>
                <div className="space-y-2">
                  {inclusions.map((inclusion) => (
                    <div key={inclusion} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`inclusion-${inclusion}`} 
                        checked={selectedInclusions.includes(inclusion)}
                        onCheckedChange={() => toggleInclusion(inclusion)}
                      />
                      <Label htmlFor={`inclusion-${inclusion}`} className="text-sm">
                        {inclusion}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
            
            {/* Mobile Filters Button */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Filter size={16} />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Packages</SheetTitle>
                    <SheetDescription>
                      Customize your package search with these filters.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Price Range Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0, 3000]}
                          max={3000}
                          step={50}
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
                    
                    {/* Rating Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Minimum Rating</h3>
                      <div className="px-2">
                        <Slider
                          defaultValue={[0]}
                          max={5}
                          step={0.5}
                          value={[minRating]}
                          onValueChange={(value) => setMinRating(value[0])}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{minRating.toFixed(1)}</span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                            5.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Package Type Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Package Type</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {packageTypes.map((packageType) => (
                          <div key={packageType} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-package-type-${packageType}`} 
                              checked={selectedPackageTypes.includes(packageType)}
                              onCheckedChange={() => togglePackageType(packageType)}
                            />
                            <Label htmlFor={`mobile-package-type-${packageType}`} className="text-sm">
                              {packageType}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Inclusions Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Inclusions</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {inclusions.map((inclusion) => (
                          <div key={inclusion} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`mobile-inclusion-${inclusion}`} 
                              checked={selectedInclusions.includes(inclusion)}
                              onCheckedChange={() => toggleInclusion(inclusion)}
                            />
                            <Label htmlFor={`mobile-inclusion-${inclusion}`} className="text-sm">
                              {inclusion}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={() => {
                      applyFilters();
                      document.querySelector('button[data-state="open"]')?.click(); // Close sheet after applying
                    }} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Package listings */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-4">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <div className="h-6 w-20 bg-gray-200 rounded"></div>
                          <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                  <div className="text-red-500 font-medium mb-2">{error}</div>
                  <Button onClick={fetchPackageData}>Try Again</Button>
                </div>
              ) : packages.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-6 text-center">
                  <div className="text-amber-500 font-medium mb-2">No packages found with the current filters.</div>
                  <Button onClick={() => {
                    setPriceRange([0, 3000]);
                    setMinRating(0);
                    setSelectedPackageTypes([]);
                    setSelectedInclusions([]);
                    fetchPackageData();
                  }}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              )}
              
              {/* Back button */}
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2"
                >
                  Back to Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default PackagesPage;
