import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';

export const BrowsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>

          {/* <button
            onClick={() => navigate('/listings/new')}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            + Sell an Item
          </button> */}
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Listings grid coming in Day 5!</h2>
          <p className="mt-2 text-gray-500">You can use the header above to navigate to the Create Listing page.</p>
        </div>
      </main>
    </div>
  );
};
