
import { Loader2, Building } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

const HotelsLoading = () => {
  const [loadingMessage, setLoadingMessage] = useState('Searching for the best hotel deals');
  const [dots, setDots] = useState('');
  const [progressValue, setProgressValue] = useState(35);

  useEffect(() => {
    const messages = [
      'Searching for the best hotel deals',
      'Checking availability for your dates',
      'Finding accommodations with your preferred amenities',
      'Comparing prices across properties',
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
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 2000);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-md w-full max-w-md border border-blue-100">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5">
              <Building size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <h3 className="text-center text-lg font-medium text-blue-800 mb-3">
          {loadingMessage}<span className="animate-pulse">{dots}</span>
        </h3>
        
        <p className="text-center text-sm text-gray-600 mb-6">
          This may take a few moments while we find the best accommodations for you
        </p>
        
        <Progress value={progressValue} className="h-2.5 mb-4" />
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-6">
          <p>Powered by AI to find you the best deals</p>
          <p className="text-blue-500">Searching...</p>
        </div>
      </div>
    </div>
  );
};

export default HotelsLoading;
