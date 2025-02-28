
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from '@/pages/SearchPage';
import FlightsPage from '@/pages/FlightsPage';
import AccommodationsPage from '@/pages/AccommodationsPage';
import BillingPage from '@/pages/BillingPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import ItineraryPage from '@/pages/ItineraryPage';
import NotFound from '@/pages/NotFound';
import CheckoutPage from '@/pages/CheckoutPage';
import AuthPage from '@/pages/AuthPage';
import SettingsPage from '@/pages/SettingsPage';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/accommodations" element={<AccommodationsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
