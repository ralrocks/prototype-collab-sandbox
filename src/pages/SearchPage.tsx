import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ComboboxDestination } from '@/components/ComboboxDestination';
import { toast } from 'sonner';
import { saveLocation } from '@/services/cityService';
import WebLayout from '@/components/WebLayout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AuthGuard } from '@/components/AuthGuard';
import { Badge } from '@/components/ui/badge';

const SearchPage = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('flights');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isOneWay, setIsOneWay] = useState(false);
  const [fromCode, setFromCode] = useState('');
  const [toCode, setToCode] = useState('');
  
  // When a location is selected, save it to localStorage
  const handleFromLocationSelect = (option: { code: string; name: string }) => {
    setFromLocation(option.name);
    setFromCode(option.code);
    localStorage.setItem('fromLocation', option.code);
    localStorage.setItem('fromLocationName', option.name);
    console.log(`Set fromLocation in localStorage: ${option.code} - ${option.name}`);
    saveLocation(option);
  };
  
  const handleToLocationSelect = (option: { code: string; name: string }) => {
    setToLocation(option.name);
    setToCode(option.code);
    localStorage.setItem('toLocation', option.code);
    localStorage.setItem('toLocationName', option.name);
    console.log(`Set toLocation in localStorage: ${option.code} - ${option.name}`);
    saveLocation(option);
  };
  
  const handleDateSelect = (date: Date | undefined, type: 'departure' | 'return') => {
    if (type === 'departure') {
      setDepartureDate(date);
    } else {
      setReturnDate(date);
    }
  };
  
  const toggleTripType = (checked: boolean) => {
    setIsOneWay(checked);
  };
  
  const handleSearch = () => {
    if (!fromLocation || !toLocation) {
      toast.error('Please select both origin and destination');
      return;
    }
    
    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }
    
    if (!isOneWay && !returnDate) {
      toast.error('Please select a return date for round trip');
      return;
    }
    
    // Save all search parameters to localStorage
    localStorage.setItem('fromLocation', fromCode);
    localStorage.setItem('fromLocationName', fromLocation);
    localStorage.setItem('toLocation', toCode);
    localStorage.setItem('toLocationName', toLocation);
    localStorage.setItem('departureDate', departureDate.toISOString());
    
    if (returnDate) {
      localStorage.setItem('returnDate', returnDate.toISOString());
    } else {
      localStorage.removeItem('returnDate');
    }
    
    localStorage.setItem('tripType', isOneWay ? 'oneway' : 'roundtrip');
    
    console.log('Saved search parameters to localStorage:');
    console.log('- fromLocation:', fromCode, '(', fromLocation, ')');
    console.log('- toLocation:', toCode, '(', toLocation, ')');
    console.log('- departureDate:', departureDate.toISOString());
    console.log('- returnDate:', returnDate ? returnDate.toISOString() : 'N/A');
    console.log('- tripType:', isOneWay ? 'oneway' : 'roundtrip');
    
    // Navigate based on the selected tab
    switch (activeTab) {
      case 'flights':
        navigate('/flights');
        break;
      case 'hotels':
        navigate('/accommodations');
        break;
      case 'cars':
        navigate('/cars');
        break;
      case 'packages':
        navigate('/packages');
        break;
      default:
        navigate('/flights');
    }
  };
  
  return (
    <AuthGuard>
      <WebLayout title="Home">
        <div className="container py-12">
          <Card className="w-full max-w-3xl mx-auto">
            <CardContent className="p-8">
              <Tabs defaultValue="flights" className="w-full">
                <TabsList>
                  <TabsTrigger value="flights" onClick={() => setActiveTab('flights')}>Flights</TabsTrigger>
                  <TabsTrigger value="hotels" onClick={() => setActiveTab('hotels')}>Hotels</TabsTrigger>
                  <TabsTrigger value="cars" onClick={() => setActiveTab('cars')}>Cars</TabsTrigger>
                  <TabsTrigger value="packages" onClick={() => setActiveTab('packages')}>Packages</TabsTrigger>
                </TabsList>
                <TabsContent value="flights" className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="trip-type" checked={isOneWay} onCheckedChange={toggleTripType} />
                      <Label htmlFor="trip-type">
                        {isOneWay ? 'One Way' : 'Round Trip'}
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ComboboxDestination
                          onSelect={handleFromLocationSelect}
                          placeholder="Leaving from"
                          selectedValue={fromLocation}
                        />
                      </div>
                      <div>
                        <ComboboxDestination
                          onSelect={handleToLocationSelect}
                          placeholder="Going to"
                          selectedValue={toLocation}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={
                              'w-full justify-start text-left font-normal' +
                              (departureDate ? ' pl-3.5' : '')
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4 opacity-50" />
                            {departureDate ? (
                              format(departureDate, 'PPP')
                            ) : (
                              <span>Pick a departure date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={departureDate}
                            onSelect={(date) => handleDateSelect(date, 'departure')}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={
                              'w-full justify-start text-left font-normal' +
                              (returnDate ? ' pl-3.5' : '')
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4 opacity-50" />
                            {returnDate ? (
                              format(returnDate, 'PPP')
                            ) : (
                              <span>{isOneWay ? 'No return date' : 'Pick a return date'}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={returnDate}
                            onSelect={(date) => handleDateSelect(date, 'return')}
                            disabled={(date) =>
                              departureDate ? date < departureDate : date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button onClick={handleSearch}>Search Flights</Button>
                  </div>
                </TabsContent>
                <TabsContent value="hotels" className="pt-6">
                  <p>Hotels search coming soon!</p>
                </TabsContent>
                <TabsContent value="cars" className="pt-6">
                  <p>Car rentals search coming soon!</p>
                </TabsContent>
                <TabsContent value="packages" className="pt-6">
                  <p>Travel packages search coming soon!</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default SearchPage;
