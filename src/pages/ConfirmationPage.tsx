
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedHousing, calculateTotal, resetBooking } = useBookingStore();
  
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
      const numberOfPieces = 100;
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
    <PhoneFrame>
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-[bounce_1s_ease-in-out_3]">
          <Check size={32} className="text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 animate-slide-up">Booking Complete!</h1>
        <p className="text-gray-600 mb-6 animate-slide-up animation-delay-100">
          Your trip has been successfully booked.
        </p>
        
        <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-6 animate-slide-up animation-delay-200">
          <div className="text-sm font-medium mb-2">Trip Summary</div>
          <div className="text-xs text-gray-600 space-y-2">
            {selectedFlight && (
              <div className="flex justify-between">
                <span>Flight:</span>
                <span>{selectedFlight.attribute}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Housing:</span>
              <span>{selectedHousing.length} options selected</span>
            </div>
            
            {selectedHousing.map((housing, index) => (
              <div key={index} className="flex justify-between pl-4 text-[10px]">
                <span>{housing.title}</span>
                <span>${housing.price}</span>
              </div>
            ))}
            
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 w-full animate-slide-up animation-delay-300">
          <Button 
            onClick={handleNewBooking}
            className="w-full p-3 bg-black text-white rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Book Another Trip
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default ConfirmationPage;
