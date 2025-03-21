
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const PriceDisplay = ({ price, isSelected, onSelect }: PriceDisplayProps) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-2xl font-bold text-blue-600 transition-colors">{formattedPrice}</div>
      
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        variant={isSelected ? "outline" : "default"}
        size="sm"
        className={`w-full transition-all ${
          isSelected 
            ? 'border-2 border-green-500 text-green-700 bg-green-50 hover:bg-green-100 font-medium' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        {isSelected ? (
          <>
            <Check className="mr-1.5 h-4 w-4" /> Selected
          </>
        ) : (
          'Select'
        )}
      </Button>
    </div>
  );
};
