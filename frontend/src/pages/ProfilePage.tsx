import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { Header } from '../components/Header';
import { parseApiError } from '../utils/errors';

export const ProfilePage = () => {
  const { user, updatePhone } = useAuth();
  const { showToast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phone_number) {
      setPhone(user.phone_number);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updatePhone(phone);
      showToast('Phone number updated successfully!', 'success');
    } catch (err: any) {
      setError(parseApiError(err) || 'Failed to update phone number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link to="/listings" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Browse Listings
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col items-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full shadow-sm mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-3xl font-bold mb-4">
                {user.name.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            {user.reg_no && (
              <p className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.reg_no}
              </p>
            )}
          </div>
          
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="block w-full rounded-lg border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Required to create listings. Only shared with buyers.
                </p>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || phone === (user.phone_number || '')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
