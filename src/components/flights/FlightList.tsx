
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
  
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) {
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('Flight list intersection observed:', entries[0].isIntersecting, 'loading:', loading, 'hasMore:', hasMore);
        if (entries[0].isIntersecting && !loading && hasMore) {
          console.log('Triggering load more flights from observer');
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      console.log('Observing flight list load more element');
      observer.observe(currentRef);
    }
    
    return () => {
      console.log('Disconnecting flight list observer');
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
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
      
      {/* This div is used as the intersection target */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center h-20">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="w-full max-w-xs mx-auto"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : 'Load More Flights'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlightList;
