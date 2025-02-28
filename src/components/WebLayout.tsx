
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface WebLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const WebLayout = ({ children, title, showBackButton = false }: WebLayoutProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button 
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="text-xl font-bold">TravelBooker</Link>
          </div>
          
          {title && <h1 className="text-lg font-medium">{title}</h1>}
          
          <nav>
            <ul className="flex space-x-6">
              <li><Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
              <li><Link to="/flights" className="text-gray-600 hover:text-gray-900">Flights</Link></li>
              <li><Link to="/accommodations" className="text-gray-600 hover:text-gray-900">Hotels</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} TravelBooker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default WebLayout;
