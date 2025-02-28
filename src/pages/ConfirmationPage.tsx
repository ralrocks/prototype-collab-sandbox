
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    selectedReturnFlight,
    selectedHousing, 
    calculateTotal, 
    resetBooking 
  } = useBookingStore();
  
  // Confetti effect on page load
  useEffect(() => {
    const createConfetti = () => {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1000';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d')!;
      const pieces: any[] = [];
      const numberOfPieces = 200;
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688'];

      for (let i = 0; i < numberOfPieces; i++) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: -20,
          rotation: Math.random() * 360,
          size: Math.random() * 12 + 5,
          speed: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach((piece, i) => {
          piece.y += piece.speed;
          piece.rotation += 2;

          ctx.save();
          ctx.translate(piece.x, piece.y);
          ctx.rotate((piece.rotation * Math.PI) / 180);
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
          ctx.restore();

          if (piece.y > canvas.height) {
            pieces[i].y = -20;
            pieces[i].x = Math.random() * canvas.width;
          }
        });

        requestAnimationFrame(animate);
      };

      animate();

      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 5000);
    };

    createConfetti();
  }, []);

  const handleNewBooking = () => {
    resetBooking();
    navigate('/');
  };

  return (
    <WebLayout>
      <div className="max-w-3xl mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Check size={32} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Booking Complete!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your trip has been successfully booked. You will receive a confirmation email shortly.
        </p>
        
        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedOutboundFlight && (
                <div>
                  <h3 className="font-medium mb-2">Outbound Flight Details</h3>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Airline:</span> {selectedOutboundFlight.attribute}</p>
                    <p><span className="font-medium">Route:</span> {selectedOutboundFlight.question1}</p>
                    <p><span className="font-medium">Price:</span> ${selectedOutboundFlight.price}</p>
                  </div>
                </div>
              )}
              
              {selectedReturnFlight && (
                <div>
                  <h3 className="font-medium mb-2">Return Flight Details</h3>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Airline:</span> {selectedReturnFlight.attribute}</p>
                    <p><span className="font-medium">Route:</span> {selectedReturnFlight.question1}</p>
                    <p><span className="font-medium">Price:</span> ${selectedReturnFlight.price}</p>
                  </div>
                </div>
              )}
              
              {selectedHousing.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Accommodation Details</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    {selectedHousing.map((housing, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{housing.title} - ${housing.price}</p>
                        <p>{housing.bulletPoints[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleNewBooking}
            className="px-8 py-2 bg-black text-white rounded-lg text-base"
            size="lg"
          >
            Book Another Trip
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="px-8 py-2"
            size="lg"
          >
            Print Confirmation
          </Button>
        </div>
      </div>
    </WebLayout>
  );
};

export default ConfirmationPage;
