
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import { ArrowDown, Share2 } from 'lucide-react';

const ItineraryPage = () => {
  const navigate = useNavigate();

  return (
    <PhoneFrame title="Your Itinerary" showBackButton>
      <div className="p-4 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 animate-slide-down">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Boston Trip</h2>
            <button className="p-1 rounded-full hover:bg-gray-200">
              <Share2 size={16} />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dates:</span>
              <span>Jun 15 - Jun 18, 2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Travelers:</span>
              <span>1 Adult</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Reference:</span>
              <span>BOS12345</span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden animate-slide-up">
          <div className="bg-gray-50 p-3 font-medium text-sm border-b flex justify-between items-center">
            <span>Flight Details</span>
            <button className="p-1 rounded-full hover:bg-gray-200">
              <ArrowDown size={14} />
            </button>
          </div>
          
          <div className="p-3">
            <div className="space-y-4">
              <div>
                <div className="font-medium mb-1">Outbound Flight</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>Jun 15, 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Airline:</span>
                    <span>Delta Airlines</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight:</span>
                    <span>DL1234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure:</span>
                    <span>8:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival:</span>
                    <span>11:15 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="font-medium mb-1">Return Flight</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>Jun 18, 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Airline:</span>
                    <span>Delta Airlines</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight:</span>
                    <span>DL5678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure:</span>
                    <span>4:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival:</span>
                    <span>7:45 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden animate-slide-up animation-delay-100">
          <div className="bg-gray-50 p-3 font-medium text-sm border-b flex justify-between items-center">
            <span>Accommodation Details</span>
            <button className="p-1 rounded-full hover:bg-gray-200">
              <ArrowDown size={14} />
            </button>
          </div>
          
          <div className="p-3">
            <div className="space-y-3">
              <div className="font-medium">Downtown Apartment</div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span>Jun 15, 2023 (3:00 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span>Jun 18, 2023 (11:00 AM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span>123 Main St, Boston</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmation:</span>
                  <span>APT98765</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between animate-slide-up animation-delay-200">
          <button 
            onClick={() => {}}
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Download PDF
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="py-2 px-4 bg-black text-white rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Book Another Trip
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default ItineraryPage;
