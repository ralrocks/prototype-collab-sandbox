
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';

const BillingPage = () => {
  const navigate = useNavigate();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => navigate('/confirmation'), 800);
  };

  return (
    <PhoneFrame title="Billing Information" showBackButton>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Name on Card
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="John Smith"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Card Number
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Expiration
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="MM/YY"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                CVC
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="123"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Billing Address
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="123 Main St"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                City
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Boston"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                ZIP
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="02108"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={formSubmitted}
            className="w-full p-3 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium mt-4 transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {formSubmitted ? 'Processing...' : 'Complete Purchase'}
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
};

export default BillingPage;
