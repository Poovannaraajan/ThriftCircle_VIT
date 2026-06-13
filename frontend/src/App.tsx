import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { PhoneNumberModal } from './components/PhoneNumberModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CreateListingPage } from './pages/CreateListingPage';
import { BrowsePage } from './pages/BrowsePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { MyListingsPage } from './pages/MyListingsPage';

function App() {
  const { needsPhone } = useAuth();

  return (
    <>
      {needsPhone && <PhoneNumberModal />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/listings" element={<BrowsePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route 
          path="/listings/new" 
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-listings" 
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
