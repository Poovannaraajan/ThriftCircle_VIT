import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8 text-lg">Oops! The page you're looking for doesn't exist or has been moved.</p>
        <Link 
          to="/" 
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          ← Go back home
        </Link>
      </div>
    </div>
  );
};
