
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Flight } from '@/types';
import { fetchFlights } from '@/services/travelApi';

export const useFlightSearch = () => {
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const from = localStorage.getItem('fromLocation') || '';
  const to = localStorage.getItem('toLocation') || '';
  const departureDate = localStorage.getItem('departureDate') || '';
  
  const loadMoreFlights = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const newFlights = await fetchFlights(
        from, 
        to, 
        departureDate, 
        undefined, 
        'oneway',
        nextPage
      );
      
      if (newFlights.length === 0) {
        setHasMore(false);
      } else {
        setOutboundFlights(prev => [...prev, ...newFlights]);
        setPage(nextPage);
      }
    } catch (err: any) {
      console.error('Error loading more flights:', err);
      toast.error('Failed to load more flights');
    } finally {
      setLoadingMore(false);
    }
  }, [from, to, departureDate, page, loadingMore, hasMore]);

  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching outbound flights from:', from, 'to:', to, 'on:', departureDate);
      
      const outboundFlightsData = await fetchFlights(from, to, departureDate, undefined, 'oneway', 1);
      console.log('Outbound flights received:', outboundFlightsData.length);
      
      setOutboundFlights(outboundFlightsData);
      setPage(1);
      setHasMore(outboundFlightsData.length >= 10);
    } catch (err: any) {
      console.error('Error fetching flights:', err);
      if (err.message?.includes('API key not found')) {
        setApiKeyMissing(true);
      } else {
        setError(err.message || 'Failed to load flight data. Please try again.');
        toast.error('Failed to load flights');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check for required data and fetch flights on component mount
  useEffect(() => {
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    if (!apiKey) {
      setApiKeyMissing(true);
      setLoading(false);
      return;
    }
    
    if (!fetchAttempted) {
      getFlights();
      setFetchAttempted(true);
    }
  }, [fetchAttempted]);

  return {
    outboundFlights,
    loading,
    loadingMore,
    error,
    hasMore,
    apiKeyMissing,
    loadMoreFlights,
    getFlights,
    setFetchAttempted
  };
};
