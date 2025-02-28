
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';

interface FormState {
  name: string;
  cardNumber: string;
  expiration: string;
  cvc: string;
  address: string;
  city: string;
  zip: string;
}

interface FormErrors {
  name?: string;
  cardNumber?: string;
  expiration?: string;
  cvc?: string;
  address?: string;
  city?: string;
  zip?: string;
}

const BillingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    cardNumber: '',
    expiration: '',
    cvc: '',
    address: '',
    city: '',
    zip: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    if (!formData.expiration.trim()) newErrors.expiration = "Expiration date is required";
    if (!formData.cvc.trim()) newErrors.cvc = "CVC is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success("Payment processed successfully!");
        navigate('/confirmation');
      }, 1500);
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  return (
    <PhoneFrame title="Billing Information" showBackButton>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Name on Card
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Smith"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Card Number
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
            />
            {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                Expiration
              </label>
              <input
                type="text"
                name="expiration"
                value={formData.expiration}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.expiration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="MM/YY"
              />
              {errors.expiration && <p className="text-xs text-red-500">{errors.expiration}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                CVC
              </label>
              <input
                type="text"
                name="cvc"
                value={formData.cvc}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
              />
              {errors.cvc && <p className="text-xs text-red-500">{errors.cvc}</p>}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Billing Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Main St"
            />
            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Boston"
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium">
                ZIP
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.zip ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="02108"
              />
              {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium mt-4 transition-transform active:scale-[0.98] hover:bg-gray-800"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Purchase'
            )}
          </Button>
        </form>
      </div>
    </PhoneFrame>
  );
};

export default BillingPage;
