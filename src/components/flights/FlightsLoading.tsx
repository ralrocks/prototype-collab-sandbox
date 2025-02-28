import { Loader2, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';

const FlightsLoading = () => {
  const [loadingMessage, setLoadingMessage] = useState('Searching for the best flight deals');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const messages = [
      'Searching for the best flight deals',
      'Checking airlines for availability',
      'Finding the most affordable options',
      'Comparing prices across carriers',
      'Almost there! Processing results'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 3000);
    
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-blue-50 rounded-lg p-6 shadow-sm w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Loader2 size={48} className="animate-spin text-primary" />
            <Plane size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
          </div>
        </div>
        
        <h3 className="text-center text-lg font-medium text-blue-800 mb-2">
          {loadingMessage}{dots}
        </h3>
        
        <p className="text-center text-sm text-gray-600 mb-4">
          This may take a few moments while we find the best options for you
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
        </div>
        
        <p className="text-center text-xs text-gray-500">
          Powered by AI to find you the best deals
        </p>
      </div>
    </div>
  );
};

export default FlightsLoading;
