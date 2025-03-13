
import { TravelPackage } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

// Travel agencies with their logos
const travelAgencies: Record<string, string> = {
  'Expedia': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Booking.com': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'TripAdvisor': 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Travelocity': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Kayak': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Orbitz': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'CheapOair': 'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Priceline': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Hotwire': 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'CheapTickets': 'https://images.unsplash.com/photo-1586611292717-f828b167408c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'TUI': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Thomas Cook': 'https://images.unsplash.com/photo-1559599238-308793637427?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Liberty Travel': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Flight Centre': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Costco Travel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'AAA Travel': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

// Default image for agencies without a matching image
const defaultTravelAgencyImage = 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

/**
 * Get appropriate travel agency image
 */
const getTravelAgencyImage = (agency: string): string => {
  const matchedAgency = Object.keys(travelAgencies).find(name => 
    agency.toLowerCase().includes(name.toLowerCase())
  );
  
  return matchedAgency ? travelAgencies[matchedAgency] : defaultTravelAgencyImage;
};

/**
 * Generate fallback travel packages when API is unavailable
 */
export const generateFallbackPackages = (
  destination: string,
  departureDate: string,
  returnDate: string
): TravelPackage[] => {
  const agencies = Object.keys(travelAgencies);
  const packageTypes = ['All Inclusive', 'Flight + Hotel', 'Flight + Hotel + Car', 'Cruise', 'Tour', 'Adventure', 'Luxury', 'Family', 'Romantic', 'Beach'];
  
  // Calculate days
  const departure = new Date(departureDate);
  const returnD = new Date(returnDate);
  const days = Math.max(3, Math.ceil((returnD.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)));
  
  return Array.from({ length: 8 }, (_, index) => {
    // Random agency
    const agency = agencies[Math.floor(Math.random() * agencies.length)];
    
    // Random package type
    const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
    
    // Random price between $499-$2999
    const totalPrice = 499 + Math.floor(Math.random() * 2500);
    
    // Random rating between 3.5-5.0
    const rating = (3.5 + Math.random() * 1.5).toFixed(1);
    
    // Random inclusions
    const inclusions = [
      'Flight',
      'Hotel',
      'Car Rental',
      'Breakfast',
      'All Meals',
      'Airport Transfer',
      'Guided Tours',
      'Activities',
      'Travel Insurance',
      'WiFi'
    ];
    
    // Randomly select 4-7 inclusions
    const selectedInclusions = inclusions
      .sort(() => 0.5 - Math.random())
      .slice(0, 4 + Math.floor(Math.random() * 4));
    
    if (packageType === 'All Inclusive' && !selectedInclusions.includes('All Meals')) {
      selectedInclusions.push('All Meals');
    }
    
    return {
      id: index + 1,
      name: `${days}-Day ${packageType} Package to ${destination}`,
      agency,
      image: getTravelAgencyImage(agency),
      packageType,
      totalPrice,
      pricePerPerson: Math.round(totalPrice / 2),
      duration: `${days} days`,
      destination,
      departureDate,
      returnDate,
      rating: parseFloat(rating),
      inclusions: selectedInclusions,
      url: `https://www.${agency.toLowerCase().replace(/\s+/g, '')}.com/packages/${destination.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

/**
 * Fetch travel packages from the Perplexity API
 */
export const fetchTravelPackages = async (
  destination: string,
  departureDate: string,
  returnDate: string,
  filters: {
    packageType?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inclusions?: string[];
  } = {}
): Promise<TravelPackage[]> => {
  console.log(`Fetching travel packages to ${destination} from ${departureDate} to ${returnDate} with filters:`, filters);
  
  // Check if API key exists
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    console.log('No Perplexity API key found');
    toast.error('API key is required to fetch travel package data');
    return generateFallbackPackages(destination, departureDate, returnDate);
  }
  
  // Build filter description for the prompt
  let filterDescription = '';
  if (filters.packageType) {
    filterDescription += `Package type: ${filters.packageType}. `;
  }
  if (filters.minPrice || filters.maxPrice) {
    filterDescription += `Price range: ${filters.minPrice || 0} to ${filters.maxPrice || '∞'} USD total. `;
  }
  if (filters.minRating) {
    filterDescription += `Minimum rating: ${filters.minRating} out of 5 stars. `;
  }
  if (filters.inclusions && filters.inclusions.length > 0) {
    filterDescription += `Must include: ${filters.inclusions.join(', ')}. `;
  }
  
  // Calculate days
  const departure = new Date(departureDate);
  const returnD = new Date(returnDate);
  const days = Math.ceil((returnD.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
  
  const systemPrompt = 'You are a travel package API. Return only valid JSON arrays of travel package data based on the query.';
  const userPrompt = `Find 8 travel packages to ${destination} for ${days} days starting on ${departureDate} and ending on ${returnDate}.
  ${filterDescription ? `Filter requirements: ${filterDescription}` : ''}
  Include major travel agencies such as Expedia, TripAdvisor, Booking.com, Travelocity, and Kayak.
  Return results as a JSON array with each package having: id, name, agency, packageType, totalPrice, pricePerPerson, duration, rating (out of 5), inclusions (array of strings), and url.
  Example format:
  [
    {
      "id": 1,
      "name": "7-Day All Inclusive Paris Getaway",
      "agency": "Expedia",
      "packageType": "All Inclusive",
      "totalPrice": 1299,
      "pricePerPerson": 649,
      "duration": "7 days",
      "rating": 4.5,
      "inclusions": ["Flight", "Hotel", "Meals", "Activities"],
      "url": "https://www.expedia.com/packages/paris-all-inclusive"
    },
    ...
  ]
  Return only the JSON array, no explanations.`;
  
  try {
    // Make the API request
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.2, 1500);
    
    // Parse the JSON from the response
    const packageData = extractJsonFromResponse(content);
    
    if (!Array.isArray(packageData) || packageData.length === 0) {
      console.error('Invalid package data received:', packageData);
      toast.error('Unable to retrieve travel package data. Using fallback data.');
      return generateFallbackPackages(destination, departureDate, returnDate);
    }
    
    // Transform the data with appropriate images
    const processedPackages = packageData.map((pkg: any, index: number) => ({
      id: pkg.id || index + 1,
      name: pkg.name || `${days}-Day Package to ${destination}`,
      agency: pkg.agency || `Travel Agency ${index + 1}`,
      image: getTravelAgencyImage(pkg.agency),
      packageType: pkg.packageType || 'Flight + Hotel',
      totalPrice: typeof pkg.totalPrice === 'number' ? pkg.totalPrice : 699 + Math.floor(Math.random() * 1200),
      pricePerPerson: typeof pkg.pricePerPerson === 'number' ? pkg.pricePerPerson : Math.round((699 + Math.floor(Math.random() * 1200)) / 2),
      duration: pkg.duration || `${days} days`,
      destination,
      departureDate,
      returnDate,
      rating: typeof pkg.rating === 'number' ? pkg.rating : parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : ['Flight', 'Hotel'],
      url: pkg.url || `https://www.${(pkg.agency || 'travel').toLowerCase().replace(/\s+/g, '')}.com/packages/${destination.toLowerCase().replace(/\s+/g, '-')}`
    }));
    
    return filterPackages(processedPackages, filters);
  } catch (error) {
    console.error('Error fetching travel packages:', error);
    toast.error('Failed to fetch travel package data. Using fallback data.');
    return generateFallbackPackages(destination, departureDate, returnDate);
  }
};

/**
 * Apply filters to travel package results
 */
const filterPackages = (packages: TravelPackage[], filters: any): TravelPackage[] => {
  if (!Array.isArray(packages)) {
    console.error('Invalid package data received:', packages);
    return [];
  }
  
  return packages.filter(pkg => {
    // Filter by package type
    if (filters.packageType && pkg.packageType !== filters.packageType) return false;
    
    // Filter by price range
    if (filters.minPrice && pkg.totalPrice < filters.minPrice) return false;
    if (filters.maxPrice && pkg.totalPrice > filters.maxPrice) return false;
    
    // Filter by rating
    if (filters.minRating && pkg.rating < filters.minRating) return false;
    
    // Filter by inclusions
    if (filters.inclusions && filters.inclusions.length > 0) {
      return filters.inclusions.every((inclusion: string) => 
        pkg.inclusions.some(pkgInclusion => 
          pkgInclusion.toLowerCase().includes(inclusion.toLowerCase())
        )
      );
    }
    
    return true;
  });
};
