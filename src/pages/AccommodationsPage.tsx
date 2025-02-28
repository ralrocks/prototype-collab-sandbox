
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Plus, Check } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';

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
    <PhoneFrame title="Select Housing Options" showBackButton>
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1 space-y-4">
          {housingOptions.map((housing) => {
            const selected = isHousingSelected(housing.id);
            return (
              <div 
                key={housing.id} 
                className={`border border-gray-200 rounded-lg p-3 ${
                  selected ? 'bg-gray-50' : ''
                }`}
              >
                <div className="font-medium text-sm mb-2">{housing.title}</div>
                <ul className="text-xs text-gray-600 space-y-1 mb-3">
                  {housing.bulletPoints.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1">•</span> {point}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">${housing.price}/night</div>
                  <Button
                    onClick={() => toggleHousingSelection(housing)}
                    variant={selected ? "outline" : "default"}
                    className={`text-xs ${
                      selected ? 'border-green-500 text-green-600' : ''
                    }`}
                    size="sm"
                  >
                    {selected ? (
                      <>Added <Check size={14} className="ml-1" /></>
                    ) : (
                      <>Add to Trip <Plus size={14} className="ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4">
          <Button
            onClick={handleContinue}
            className="w-full p-2 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all"
            disabled={selectedHousing.length === 0}
          >
            Next Step
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default AccommodationsPage;
