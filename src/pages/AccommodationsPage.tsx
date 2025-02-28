
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import { Heart, ArrowRight } from 'lucide-react';

interface Accommodation {
  id: number;
  type: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  liked: boolean;
  selected: boolean;
}

const AccommodationsPage = () => {
  const navigate = useNavigate();
  
  const [accommodations, setAccommodations] = useState<Accommodation[]>([
    { 
      id: 1, 
      type: 'Apartment', 
      description: '1 queen + 2 bedrooms • 2 bathrooms • WiFi • Kitchen • theatre', 
      price: 125, 
      rating: 4.8, 
      reviews: 34,
      liked: false,
      selected: false
    },
    { 
      id: 2, 
      type: 'Apartment', 
      description: '1 queen + 2 bedrooms • 2 bathrooms • WiFi • Kitchen • theatre', 
      price: 145, 
      rating: 4.8, 
      reviews: 26,
      liked: false,
      selected: false
    },
    { 
      id: 3, 
      type: 'Apartment', 
      description: '1 queen + 2 bedrooms • 2 bathrooms • WiFi • Kitchen • theatre', 
      price: 180, 
      rating: 4.9, 
      reviews: 42,
      liked: false,
      selected: false
    },
    { 
      id: 4, 
      type: 'Apartment', 
      description: '1 queen + 2 bedrooms • 2 bathrooms • WiFi • Kitchen • theatre', 
      price: 155, 
      rating: 4.6, 
      reviews: 19,
      liked: false,
      selected: false
    },
    { 
      id: 5, 
      type: 'Apartment', 
      description: '1 queen + 2 bedrooms • 2 bathrooms • WiFi • Kitchen • theatre', 
      price: 200, 
      rating: 4.9, 
      reviews: 51,
      liked: false,
      selected: false
    }
  ]);

  const toggleLiked = (id: number) => {
    setAccommodations(accommodations.map(accommodation => 
      accommodation.id === id ? { ...accommodation, liked: !accommodation.liked } : accommodation
    ));
  };

  const toggleSelected = (id: number) => {
    setAccommodations(accommodations.map(accommodation => 
      accommodation.id === id ? { ...accommodation, selected: !accommodation.selected } : accommodation
    ));
  };

  const handleContinue = () => {
    if (accommodations.some(accommodation => accommodation.selected)) {
      navigate('/checkout');
    }
  };

  return (
    <PhoneFrame title="Next choose housing!" showBackButton>
      <div className="p-4 flex flex-col h-full">
        <div className="flex-1">
          <div className="space-y-4 list-fade-in">
            {accommodations.map((accommodation) => (
              <div 
                key={accommodation.id} 
                className="accommodation-card border border-gray-200 rounded-lg overflow-hidden shadow-sm relative"
              >
                <div className="grid grid-cols-7 gap-2">
                  <div className="col-span-3 bg-gray-100 aspect-square flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-xs text-center">Image</div>
                  </div>
                  <div className="col-span-4 p-2 pr-7">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-gray-500 mb-1">
                          Click/tap subtitle to go
                        </div>
                        <div className="font-semibold text-sm">
                          {accommodation.type}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLiked(accommodation.id)}
                        className="like-button absolute top-2 right-2"
                        aria-label={accommodation.liked ? "Unlike" : "Like"}
                      >
                        <Heart 
                          size={16} 
                          className={`${accommodation.liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      {accommodation.description}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-xs font-semibold">★ {accommodation.rating}</div>
                        <div className="text-[10px] text-gray-500 ml-1">({accommodation.reviews} reviews)</div>
                      </div>
                      <div className="text-sm font-semibold">${accommodation.price} <span className="text-[10px] text-gray-500">/</span></div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-2 flex justify-end">
                  <input
                    type="checkbox"
                    checked={accommodation.selected}
                    onChange={() => toggleSelected(accommodation.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/25"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleContinue}
            className="w-full p-2 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium transition-transform active:scale-[0.98] disabled:opacity-70"
            disabled={!accommodations.some(accommodation => accommodation.selected)}
          >
            Continue to Checkout
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default AccommodationsPage;
