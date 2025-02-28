
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedHousing, calculateTotal } = useBookingStore();
  
  const housingTotal = selectedHousing.reduce((sum, item) => sum + item.price, 0);
  const flightPrice = selectedFlight?.price || 0;
  const additionalFees = 2500; // SAX to Section fee
  const totalPrice = calculateTotal();

  const handleCheckout = (paymentMethod: string) => {
    toast.success(`Selected ${paymentMethod} payment method`);
    navigate('/billing');
  };

  return (
    <PhoneFrame title="Review Your Trip" showBackButton>
      <div className="p-4 flex flex-col h-full">
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 animate-slide-down">
          <div className="p-3 bg-gray-50 font-medium text-sm border-b">
            Subtotal for your trip
          </div>
          <div className="p-3 space-y-3">
            {selectedFlight && (
              <div className="flex justify-between text-sm">
                <div>Flight: {selectedFlight.attribute}</div>
                <div>${selectedFlight.price}</div>
              </div>
            )}
            
            {selectedHousing.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <div>Selected Housing:</div>
                  <div>${housingTotal}</div>
                </div>
                {selectedHousing.map((housing, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600 pl-2">
                    <div>{housing.title}</div>
                    <div>${housing.price}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-3 text-xs text-gray-600">
              <div className="flex justify-between mb-1">
                <div>SAX to Section:</div>
                <div>${additionalFees}</div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <div>Total First Year Trip</div>
                <div>${totalPrice}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mt-auto">
          <Button
            onClick={() => handleCheckout('green')}
            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          >
            🟢 Pay Now
          </Button>
          
          <Button
            onClick={() => handleCheckout('purple')}
            className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          >
            🟣 Pay Later
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default CheckoutPage;
