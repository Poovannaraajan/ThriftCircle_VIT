import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { PhoneNumberModal } from './components/PhoneNumberModal';

function App() {
  const { needsPhone } = useAuth();

  return (
    <>
      {needsPhone && <PhoneNumberModal />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
