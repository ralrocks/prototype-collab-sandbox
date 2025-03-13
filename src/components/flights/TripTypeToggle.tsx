
import { Switch } from '@/components/ui/switch';

interface TripTypeToggleProps {
  isOneWay: boolean;
  toggleTripType: (checked: boolean) => void;
}

const TripTypeToggle = ({ isOneWay, toggleTripType }: TripTypeToggleProps) => {
  return (
    <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
      <span className="font-medium">Trip Type:</span>
      <div className="flex items-center space-x-2">
        <span className={!isOneWay ? "font-medium text-blue-600" : "text-gray-500"}>Round Trip</span>
        <Switch 
          checked={isOneWay} 
          onCheckedChange={toggleTripType}
        />
        <span className={isOneWay ? "font-medium text-blue-600" : "text-gray-500"}>One Way</span>
      </div>
    </div>
  );
};

export default TripTypeToggle;
