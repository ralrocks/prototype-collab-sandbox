
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flight } from '@/types';
import { useNavigate } from 'react-router-dom';
import FlightCard from './FlightCard';
import { useEffect, useRef, useState } from 'react';

interface FlightListProps {
  flights: Flight[];
  direction: 'outbound' | 'return';
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight, direction?: 'outbound' | 'return') => void;
  fromName: string;
  toName: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const FlightList = ({ 
  flights, 
  direction, 
  selectedFlight, 
  onSelectFlight,
  fromName,
  toName,
  onLoadMore,
  hasMore = false,
  loading = false
}: FlightListProps) => {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Clean up previous observer
    if (observer) {
      observer.disconnect();
    }
    
    // Create a new intersection observer for infinite scrolling
    if (onLoadMore && hasMore) {
      const newObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading && hasMore) {
            onLoadMore();
          }
        },
        { threshold: 0.5 }
      );
      
      if (loadMoreRef.current) {
        newObserver.observe(loadMoreRef.current);
      }
      
      setObserver(newObserver);
      
      return () => {
        newObserver.disconnect();
      };
    }
  }, [onLoadMore, hasMore, loading, flights.length]);
  
  if (flights.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500 mb-4">No flights available for this route. Try another search.</p>
          <Button onClick={() => navigate('/')}>
            Back to Search
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          direction={direction}
          isSelected={selectedFlight?.id === flight.id}
          onSelect={(f) => onSelectFlight(f, direction)}
          fromName={fromName}
          toName={toName}
        />
      ))}
      
      {loading && (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="py-4 text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="w-full max-w-xs mx-auto"
          >
            Load More Flights
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlightList;
