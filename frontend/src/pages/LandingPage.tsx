import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle, logout } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (response: any) => {
    if (response.credential) {
      try {
        await loginWithGoogle(response.credential);
        navigate('/listings');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google sign-in failed');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900">
          <span className="text-blue-600">Thrift</span>Circle
        </h1>
        <p className="mb-8 text-lg text-gray-600">Buy, sell and lend within VIT campus</p>

        <div className="mb-8 space-y-4">
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2">
                {user.avatar_url && (
                  <img src={user.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full" />
                )}
                <span className="font-medium text-gray-800">Welcome, {user.name}</span>
              </div>
              <button
                onClick={() => navigate('/listings')}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                Go to Browse
              </button>
              <button
                onClick={() => logout()}
                className="w-full rounded-lg border-2 border-red-500 px-6 py-3 font-semibold text-red-500 transition hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {!user && (
          <button
            onClick={() => navigate('/listings')}
            className="w-full rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Browse Listings as Guest
          </button>
        )}
      </div>
    </div>
  );
};
