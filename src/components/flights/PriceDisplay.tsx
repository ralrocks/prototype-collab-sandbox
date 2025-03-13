
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
    <div className="flex flex-col items-center space-y-2">
      <div className="text-2xl font-bold text-blue-600">{formattedPrice}</div>
      
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        variant={isSelected ? "outline" : "default"}
        size="sm"
        className={`w-full transition-all ${
          isSelected 
            ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
        }`}
      >
        {isSelected ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Selected
          </>
        ) : (
          'Select'
        )}
      </Button>
    </div>
  );
};
