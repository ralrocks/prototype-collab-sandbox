
import { Check, Calendar, Plane, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flight } from '@/types';
import FlightList from './FlightList';
import { Badge } from '@/components/ui/badge';

interface FlightTabsProps {
  activeTab: 'outbound' | 'return';
  setActiveTab: (value: 'outbound' | 'return') => void;
  outboundFlights: Flight[];
  returnFlights: Flight[];
  selectedOutboundFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  handleFlightSelect: (flight: Flight, direction: 'outbound' | 'return') => void;
  departureDate: string;
  returnDate?: string;
  fromName: string;
  toName: string;
}

const FlightTabs = ({
  activeTab,
  setActiveTab,
  outboundFlights,
  returnFlights,
  selectedOutboundFlight,
  selectedReturnFlight,
  handleFlightSelect,
  departureDate,
  returnDate,
  fromName,
  toName
}: FlightTabsProps) => {
  return (
    <Tabs 
      defaultValue="outbound" 
      value={activeTab} 
      onValueChange={(value) => setActiveTab(value as 'outbound' | 'return')}
      className="mb-8"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="outbound" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          <Plane className="mr-2 h-4 w-4" />
          Outbound Flight
          {selectedOutboundFlight && <Check className="ml-2 h-4 w-4 text-green-500" />}
        </TabsTrigger>
        <TabsTrigger value="return" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          <RotateCcw className="mr-2 h-4 w-4" />
          Return Flight
          {selectedReturnFlight && <Check className="ml-2 h-4 w-4 text-green-500" />}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="outbound" className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center text-blue-700">
          <Calendar className="mr-2 h-5 w-5" />
          <span>Outbound: <strong>{departureDate}</strong> - {fromName} to {toName}</span>
        </div>
        
        <FlightList
          flights={outboundFlights}
          direction="outbound"
          selectedFlight={selectedOutboundFlight}
          onSelectFlight={handleFlightSelect}
          fromName={fromName}
          toName={toName}
        />
      </TabsContent>
      
      <TabsContent value="return" className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center text-blue-700">
          <Calendar className="mr-2 h-5 w-5" />
          <span>Return: <strong>{returnDate}</strong> - {toName} to {fromName}</span>
        </div>
        
        <FlightList
          flights={returnFlights}
          direction="return"
          selectedFlight={selectedReturnFlight}
          onSelectFlight={handleFlightSelect}
          fromName={toName}
          toName={fromName}
        />
      </TabsContent>
    </Tabs>
  );
};

export default FlightTabs;
