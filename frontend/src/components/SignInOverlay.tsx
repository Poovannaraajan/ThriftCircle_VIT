import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

interface SignInOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInOverlay = ({ isOpen, onClose }: SignInOverlayProps) => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSuccess = async (response: any) => {
    try {
      if (response.credential) {
        await loginWithGoogle(response.credential);
        onClose(); // Close modal on success
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign-in failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <span className="text-3xl">🔒</span>
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Sign in required</h2>
          <p className="mb-8 text-gray-600">
            Contact information is securely hidden. Sign in with your verified VIT student account to view seller details.
          </p>

          <div className="flex flex-col items-center gap-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed')}
              useOneTap
              shape="rectangular"
              size="large"
              theme="outline"
              hosted_domain="vitstudent.ac.in"
            />
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </div>
        </div>
        
        <div className="bg-[#f8f5fd] px-8 py-4 text-center text-xs text-gray-500">
          We protect buyer and seller privacy. Only vitstudent.ac.in domains are permitted.
        </div>
      </div>
    </div>
  );
};
