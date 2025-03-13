
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';

import Index from './pages/Index';
import SearchPage from './pages/SearchPage';
import FlightsPage from './pages/FlightsPage';
import ReturnFlightsPage from './pages/ReturnFlightsPage';
import AccommodationsPage from './pages/AccommodationsPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import ItineraryPage from './pages/ItineraryPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import BillingPage from './pages/BillingPage';
import NotFound from './pages/NotFound';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ApiKeyProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/flights" element={<FlightsPage />} />
              <Route path="/return-flights" element={<ReturnFlightsPage />} />
              <Route path="/accommodations" element={<AccommodationsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </ApiKeyProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
