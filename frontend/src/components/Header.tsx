import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            <span className="text-blue-600">Thrift</span>Circle
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/listings/new')}
            className="hidden sm:inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            + Post Listing
          </button>

          {user ? (
            <div className="flex items-center gap-4 border-l pl-4">
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="border-l pl-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Log In
              </button>
            </div>
          )}
          
          {/* Mobile post button */}
          <button
            onClick={() => navigate('/listings/new')}
            className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
};
