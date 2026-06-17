import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SignInOverlay } from './SignInOverlay';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#2d1b4e]" style={{ fontFamily: "'Playfair Display', serif" }}>
            ThriftCircle
          </span>
        </Link>

        <div className="flex items-center gap-4">

          {user ? (
            <div className="flex items-center gap-4 border-l pl-4">
              <button
                onClick={() => navigate('/listings/new')}
                className="hidden sm:flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition"
              >
                + Post Item
              </button>
              <Link to="/my-listings" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                My Listings
              </Link>
              <Link to="/wishlist" className="text-sm font-semibold text-gray-600 hover:text-red-500 transition flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span className="hidden lg:block">Wishlist</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 group">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold group-hover:bg-primary-200 transition">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-primary-600 transition">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l pl-4">
              <button
                onClick={() => setShowSignIn(true)}
                className="hidden sm:flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition"
              >
                + Post Item
              </button>
              <button
                onClick={() => setShowSignIn(true)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition"
              >
                Log In
              </button>
            </div>
          )}

          {/* Mobile post button */}
          <button
            onClick={() => user ? navigate('/listings/new') : setShowSignIn(true)}
            className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition"
          >
            +
          </button>
        </div>
      </div>
      
      <SignInOverlay isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </header>
  );
};
