
import { useState } from 'react';
import PhoneFrame from '@/components/PhoneFrame';
import { Apple, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [checkoutMethod, setCheckoutMethod] = useState<string | null>(null);
  
  const handleCheckout = (method: string) => {
    setCheckoutMethod(method);
    // In a real app, would process payment here
    setTimeout(() => navigate('/confirmation'), 1000);
  };

  return (
    <PhoneFrame title="Subtotal for your trip!" showBackButton>
      <div className="p-4 flex flex-col h-full">
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 animate-slide-down">
          <div className="p-3 bg-gray-50 font-medium text-sm border-b">
            Accommodation
          </div>
          <div className="p-3 space-y-3">
            <div className="flex justify-between text-sm">
              <div>Delta Flight (Boston)</div>
              <div>$220</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Downtown Apartment</div>
              <div>$200/night x 3 nights</div>
            </div>
            <div className="border-t pt-3 text-xs text-gray-600">
              <div className="flex justify-between mb-1">
                <div>Cleaning Fee</div>
                <div>$50.00</div>
              </div>
              <div className="flex justify-between mb-1">
                <div>Service Fee</div>
                <div>$35.00</div>
              </div>
              <div className="flex justify-between">
                <div>Booking Fee</div>
                <div>$15.95</div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <div>Total for your trip</div>
                <div>$925.95</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => handleCheckout('apple')}
            className={`payment-button w-full p-3 border ${
              checkoutMethod === 'apple' 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            } rounded-lg flex items-center justify-center text-sm font-medium transition-all`}
          >
            <Apple size={16} className="mr-2" />
            Checkout with Apple
          </button>
          
          <button
            onClick={() => handleCheckout('paypal')}
            className={`payment-button w-full p-3 border ${
              checkoutMethod === 'paypal' 
                ? 'bg-[#0070ba] text-white border-[#0070ba]' 
                : 'bg-white text-black border-gray-300 hover:bg-gray-50'
            } rounded-lg flex items-center justify-center text-sm font-medium transition-all`}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.036-.02.114a.804.804 0 0 1-.794.68h-2.52a.483.483 0 0 1-.477-.558l.005-.02 1.045-6.648a.973.973 0 0 1 .96-.822h2.016c3.608 0 6.406-1.464 7.236-5.7.045-.226.08-.443.11-.653.107-.79.057-1.483-.212-2.017.059-.06.115-.12.175-.176" fill="#003087"></path>
              <path d="M13.836 5.248c.45.05.897.144 1.333.281a4.35 4.35 0 0 1 .949.48c.07.047.138.099.202.15a3.56 3.56 0 0 1 .212 2.016c-.03.21-.065.427-.11.653-.83 4.235-3.628 5.7-7.236 5.7h-2.016a.973.973 0 0 0-.96.821l-1.047 6.648-.026.013a.483.483 0 0 1-.477.557h-1.85a.483.483 0 0 1-.476-.558l.004-.02 1.2-7.634a.973.973 0 0 1 .96-.821h2.67c.245 0 .435 0 .582-.003 2.908-.048 5.086-1.205 5.951-4.432.217-.807.241-1.493.087-2.05v-.001" fill="#003087"></path>
              <path d="M9.41 5.366c.037 0 .075 0 .112.002.28.005.56.023.84.056.593.07 1.159.206 1.694.405.29.107.565.234.825.38.113.063.22.13.323.202.107.072.208.15.308.23-.214-.02-.433-.034-.653-.047a14.71 14.71 0 0 0-2.153.03 13.286 13.286 0 0 0-3.503.7c-.295.11-.577.232-.844.365a6.19 6.19 0 0 0-.323.175c.098-.563.28-1.105.542-1.605a3.37 3.37 0 0 1 2.833-1.893" fill="#003087"></path>
            </svg>
            Checkout with PayPal
          </button>
          
          <button
            onClick={() => navigate('/billing')}
            className="payment-button w-full p-3 border border-gray-300 bg-white text-black hover:bg-gray-50 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          >
            <CreditCard size={16} className="mr-2" />
            Continue to billing information
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default CheckoutPage;
