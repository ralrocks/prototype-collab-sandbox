
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Plus, Check, Bed, Coffee, Wifi } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Housing {
  id: number;
  title: string;
  bulletPoints: string[];
  price: number;
}

const AccommodationsPage = () => {
  const navigate = useNavigate();
  const { selectedHousing, addHousing, removeHousing } = useBookingStore();
  
  const [housingOptions] = useState<Housing[]>([
    { 
      id: 1, 
      title: 'Clothing wildlife for gf', 
      bulletPoints: ['Slighting & Deliciousness', 'Ocean view', 'WiFi included'], 
      price: 80
    },
    { 
      id: 2, 
      title: 'Downtown Luxury Suite', 
      bulletPoints: ['Walking distance to attractions', 'Kitchen & laundry', 'Fitness center'], 
      price: 120
    },
    { 
      id: 3, 
      title: 'Historic District Apartment', 
      bulletPoints: ['Near museums & restaurants', 'Cozy atmosphere', 'Local experience'], 
      price: 95
    },
    { 
      id: 4, 
      title: 'Seaside Cottage Retreat', 
      bulletPoints: ['Beach access', 'Private patio', 'Fully equipped kitchen'], 
      price: 150
    },
  ]);

  const isHousingSelected = (id: number) => {
    return selectedHousing.some(h => h.id === id);
  };

  const toggleHousingSelection = (housing: Housing) => {
    if (isHousingSelected(housing.id)) {
      removeHousing(housing.id);
    } else {
      addHousing(housing);
    }
  };

  const handleContinue = () => {
    if (selectedHousing.length === 0) {
      toast.error("Please select at least one housing option!");
      return;
    }
    navigate('/checkout');
  };

  return (
    <WebLayout title="Select Housing Options" showBackButton>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Select Your Accommodations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {housingOptions.map((housing) => {
            const selected = isHousingSelected(housing.id);
            return (
              <Card 
                key={housing.id} 
                className={`overflow-hidden hover:shadow-md transition-all ${
                  selected ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Bed size={32} className="text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{housing.title}</h3>
                  <ul className="space-y-2 mb-4">
                    {housing.bulletPoints.map((point, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        {i === 0 && <Coffee size={16} className="mr-2 mt-0.5 flex-shrink-0" />}
                        {i === 1 && <Bed size={16} className="mr-2 mt-0.5 flex-shrink-0" />}
                        {i === 2 && <Wifi size={16} className="mr-2 mt-0.5 flex-shrink-0" />}
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Badge variant="outline" className="font-medium">
                    ${housing.price}/night
                  </Badge>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() => toggleHousingSelection(housing)}
                    variant={selected ? "outline" : "default"}
                    className={`w-full ${
                      selected ? 'border-green-500 text-green-600' : ''
                    }`}
                  >
                    {selected ? (
                      <>Added <Check size={16} className="ml-1" /></>
                    ) : (
                      <>Add to Trip <Plus size={16} className="ml-1" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-end">
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
