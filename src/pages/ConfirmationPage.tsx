
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import { Check } from 'lucide-react';

const ConfirmationPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confetti = () => {
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

    confetti();
  }, []);

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-[bounce_1s_ease-in-out_3]">
          <Check size={32} className="text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 animate-slide-up">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6 animate-slide-up animation-delay-100">
          Your trip to Boston has been successfully booked.
        </p>
        
        <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-6 animate-slide-up animation-delay-200">
          <div className="text-sm font-medium mb-2">Trip Summary</div>
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Flight:</span>
              <span>Delta Airlines</span>
            </div>
            <div className="flex justify-between">
              <span>Dates:</span>
              <span>Jun 15 - Jun 18, 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Accommodation:</span>
              <span>Downtown Apartment</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total:</span>
              <span>$925.95</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 w-full animate-slide-up animation-delay-300">
          <button 
            onClick={() => navigate('/itinerary')}
            className="w-full p-3 bg-black text-white rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            View Itinerary
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Book Another Trip
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default ConfirmationPage;
