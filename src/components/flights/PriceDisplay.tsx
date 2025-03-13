
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PriceDisplayProps {
  price: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const PriceDisplay = ({ price, isSelected, onSelect }: PriceDisplayProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-lg font-bold">${price}</span>
        <p className="text-xs text-gray-500">per person</p>
      </div>
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {isSelected ? (
                  <>
                    <Check size={16} className="mr-1" />
                    Selected
                  </>
                ) : (
                  "Select"
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSelected 
                ? "This flight is selected" 
                : "Click to select this flight"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
