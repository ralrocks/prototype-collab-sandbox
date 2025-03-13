
import { CarRental } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

// Car rental companies with their logos
const carRentalCompanies: Record<string, string> = {
  'Hertz': 'https://images.unsplash.com/photo-1589360510512-ddb05a345511?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Enterprise': 'https://images.unsplash.com/photo-1554223090-7e482851df45?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Avis': 'https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Budget': 'https://images.unsplash.com/photo-1551830820-330a71b99659?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'National': 'https://images.unsplash.com/photo-1583267746897-2cf66da7b86e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Alamo': 'https://images.unsplash.com/photo-1601514526053-7014073018ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Sixt': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Thrifty': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Dollar': 'https://images.unsplash.com/photo-1585503418537-88331351ad99?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Europcar': 'https://images.unsplash.com/photo-1617469226350-faa82d6a3837?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Default image for car rental companies without a matching image
const defaultCarRentalImage = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

/**
 * Get appropriate car rental company image
 */
const getCarRentalImage = (company: string): string => {
  const matchedCompany = Object.keys(carRentalCompanies).find(name => 
    company.toLowerCase().includes(name.toLowerCase())
  );
  
  return matchedCompany ? carRentalCompanies[matchedCompany] : defaultCarRentalImage;
};

/**
 * Generate fallback car rentals when API is unavailable
 */
export const generateFallbackCarRentals = (
  location: string,
  pickupDate: string,
  returnDate: string
): CarRental[] => {
  const companies = Object.keys(carRentalCompanies);
  const carTypes = ['Economy', 'Compact', 'Mid-size', 'Standard', 'Full-size', 'Premium', 'Luxury', 'SUV', 'Minivan', 'Convertible'];
  
  return Array.from({ length: 8 }, (_, index) => {
    // Random company
    const company = companies[Math.floor(Math.random() * companies.length)];
    
    // Random car type
    const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
    
    // Random price between $25-$150 per day
    const pricePerDay = 25 + Math.floor(Math.random() * 125);
    
    // Calculate total days
    const pickup = new Date(pickupDate);
    const dropoff = new Date(returnDate);
    const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Random features
    const features = [
      'Automatic Transmission',
      'Air Conditioning',
      'Bluetooth',
      'Cruise Control',
      'GPS Navigation',
      'USB Charging',
      'Backup Camera'
    ];
    
    // Randomly select 3-5 features
    const selectedFeatures = features
      .sort(() => 0.5 - Math.random())
      .slice(0, 3 + Math.floor(Math.random() * 3));
    
    return {
      id: index + 1,
      company,
      image: getCarRentalImage(company),
      carType,
      pricePerDay,
      totalPrice: pricePerDay * days,
      location,
      features: selectedFeatures,
      availability: Math.random() > 0.2 ? 'Available' : 'Limited',
      pickupLocation: `${location} Airport`,
      dropoffLocation: `${location} Airport`
    };
  });
};

/**
 * Fetch car rentals from the Perplexity API
 */
export const fetchCarRentals = async (
  location: string,
  pickupDate: string,
  returnDate: string,
  filters: {
    carType?: string;
    minPrice?: number;
    maxPrice?: number;
    features?: string[];
  } = {}
): Promise<CarRental[]> => {
  console.log(`Fetching car rentals in ${location} from ${pickupDate} to ${returnDate} with filters:`, filters);
  
  // Check if API key exists
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found');
    toast.error('API key is required to fetch car rental data');
    return generateFallbackCarRentals(location, pickupDate, returnDate);
  }
  
  // Build filter description for the prompt
  let filterDescription = '';
  if (filters.carType) {
    filterDescription += `Car type: ${filters.carType}. `;
  }
  if (filters.minPrice || filters.maxPrice) {
    filterDescription += `Price range: ${filters.minPrice || 0} to ${filters.maxPrice || '∞'} USD per day. `;
  }
  if (filters.features && filters.features.length > 0) {
    filterDescription += `Must include features: ${filters.features.join(', ')}. `;
  }
  
  const systemPrompt = 'You are a car rental API. Return only valid JSON arrays of car rental data based on the query.';
  const userPrompt = `Find 8 car rentals in ${location} for pickup on ${pickupDate} and return on ${returnDate}.
  ${filterDescription ? `Filter requirements: ${filterDescription}` : ''}
  Include major car rental companies such as Hertz, Enterprise, Avis, Budget, National, Alamo, Sixt, Thrifty, and Dollar.
  Return results as a JSON array with each car rental having: id, company, carType, pricePerDay, features (array of strings), availability, pickupLocation, and dropoffLocation.
  Example format:
  [
    {
      "id": 1,
      "company": "Hertz",
      "carType": "Economy",
      "pricePerDay": 35,
      "features": ["Automatic Transmission", "Air Conditioning", "Bluetooth"],
      "availability": "Available",
      "pickupLocation": "JFK Airport",
      "dropoffLocation": "JFK Airport"
    },
    ...
  ]
  Return only the JSON array, no explanations.`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.2, 1500);
    
    // Parse the JSON from the response
    const carRentalData = extractJsonFromResponse(content);
    
    if (!Array.isArray(carRentalData) || carRentalData.length === 0) {
      console.error('Invalid car rental data received:', carRentalData);
      toast.error('Unable to retrieve car rental data. Using fallback data.');
      return generateFallbackCarRentals(location, pickupDate, returnDate);
    }
    
    // Calculate total days
    const pickup = new Date(pickupDate);
    const dropoff = new Date(returnDate);
    const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Transform the data with appropriate images
    const processedRentals = carRentalData.map((rental: any, index: number) => ({
      id: rental.id || index + 1,
      company: rental.company || `Car Rental ${index + 1}`,
      image: getCarRentalImage(rental.company),
      carType: rental.carType || 'Standard',
      pricePerDay: typeof rental.pricePerDay === 'number' ? rental.pricePerDay : 35 + Math.floor(Math.random() * 65),
      totalPrice: typeof rental.pricePerDay === 'number' ? rental.pricePerDay * days : (35 + Math.floor(Math.random() * 65)) * days,
      features: Array.isArray(rental.features) ? rental.features : ['Automatic Transmission', 'Air Conditioning'],
      availability: rental.availability || 'Available',
      location,
      pickupLocation: rental.pickupLocation || `${location} Airport`,
      dropoffLocation: rental.dropoffLocation || `${location} Airport`
    }));
    
    return filterCarRentals(processedRentals, filters);
  } catch (error) {
    console.error('Error fetching car rentals:', error);
    toast.error('Failed to fetch car rental data. Using fallback data.');
    return generateFallbackCarRentals(location, pickupDate, returnDate);
  }
};

/**
 * Apply filters to car rental results
 */
const filterCarRentals = (rentals: CarRental[], filters: any): CarRental[] => {
  if (!Array.isArray(rentals)) {
    console.error('Invalid car rental data received:', rentals);
    return [];
  }
  
  return rentals.filter(rental => {
    // Filter by car type
    if (filters.carType && rental.carType !== filters.carType) return false;
    
    // Filter by price range
    if (filters.minPrice && rental.pricePerDay < filters.minPrice) return false;
    if (filters.maxPrice && rental.pricePerDay > filters.maxPrice) return false;
    
    // Filter by features
    if (filters.features && filters.features.length > 0) {
      return filters.features.every((feature: string) => 
        rental.features.some(rentalFeature => 
          rentalFeature.toLowerCase().includes(feature.toLowerCase())
        )
      );
    }
    
    return true;
  });
};
