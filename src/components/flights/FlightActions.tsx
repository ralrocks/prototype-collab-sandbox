
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Flight } from '@/types';

interface FlightActionsProps {
  selectedFlight: Flight | null;
  isOneWay: boolean;
  skipAccommodations: boolean;
  setSkipAccommodations: (skip: boolean) => void;
}

const FlightActions = ({ 
  selectedFlight, 
  isOneWay, 
  skipAccommodations, 
  setSkipAccommodations 
}: FlightActionsProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedFlight) {
      toast.error("Please select an outbound flight!");
      return;
    }
    
    if (!isOneWay) {
      navigate('/return-flights');
      return;
    }
    
    if (skipAccommodations) {
      navigate('/checkout');
    } else {
      navigate('/accommodations');
    }
  };

  return (
    <>
      {isOneWay && (
        <div className="mb-6 flex items-center space-x-2">
          <Checkbox 
            id="skip-accommodations" 
            checked={skipAccommodations}
            onCheckedChange={(checked) => setSkipAccommodations(checked === true)}
          />
          <Label 
            htmlFor="skip-accommodations" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Skip hotel selection and proceed directly to checkout
          </Label>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          Change Search
        </Button>
        
        <Button
          onClick={handleContinue}
          className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          disabled={!selectedFlight}
        >
          {isOneWay 
            ? (skipAccommodations ? 'Continue to Checkout' : 'Continue to Accommodations') 
            : 'Continue to Return Flights'}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </>
  );
};

export default FlightActions;
