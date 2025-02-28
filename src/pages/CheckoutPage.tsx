
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    selectedReturnFlight, 
    selectedHousing, 
    calculateTotal 
  } = useBookingStore();
  
  const housingTotal = selectedHousing.reduce((sum, item) => sum + item.price, 0);
  const outboundFlightPrice = selectedOutboundFlight?.price || 0;
  const returnFlightPrice = selectedReturnFlight?.price || 0;
  const additionalFees = 2500; // SAX to Section fee
  const totalPrice = calculateTotal();

  const handleCheckout = (paymentMethod: string) => {
    toast.success(`Selected ${paymentMethod} payment method`);
    navigate('/billing');
  };

  return (
    <WebLayout title="Review Your Trip" showBackButton>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOutboundFlight && (
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-3">Outbound Flight</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>{selectedOutboundFlight.attribute}</span>
                        <span className="font-medium">${selectedOutboundFlight.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedOutboundFlight.question1}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedReturnFlight && (
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-3">Return Flight</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>{selectedReturnFlight.attribute}</span>
                        <span className="font-medium">${selectedReturnFlight.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedReturnFlight.question1}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedHousing.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Accommodations</h3>
                    <div className="space-y-3">
                      {selectedHousing.map((housing, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span>{housing.title}</span>
                            <span className="font-medium">${housing.price}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {housing.bulletPoints[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOutboundFlight && (
                    <div className="flex justify-between">
                      <span>Outbound Flight</span>
                      <span>${outboundFlightPrice}</span>
                    </div>
                  )}
                  
                  {selectedReturnFlight && (
                    <div className="flex justify-between">
                      <span>Return Flight</span>
                      <span>${returnFlightPrice}</span>
                    </div>
                  )}
                  
                  {selectedHousing.length > 0 && (
                    <div className="flex justify-between">
                      <span>Accommodations</span>
                      <span>${housingTotal}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>SAX to Section</span>
                    <span>${additionalFees}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={() => handleCheckout('green')}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      🟢 Pay Now
                    </Button>
                    
                    <Button
                      onClick={() => handleCheckout('purple')}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      🟣 Pay Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default CheckoutPage;
