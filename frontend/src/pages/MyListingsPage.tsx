import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { fetchMyListings } from '../api/listings';
import { ListingCard } from '../components/ListingCard';

export const MyListingsPage = () => {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  });

  const skeletons = Array(4).fill(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <button
            onClick={() => navigate('/listings/new')}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            + Post New Item
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            skeletons.map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="aspect-square w-full animate-pulse bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200 mt-4"></div>
                </div>
              </div>
            ))
          ) : listings?.length === 0 ? (
            <div className="col-span-full py-20 text-center rounded-xl border border-dashed border-gray-300 bg-white">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-900">You haven't posted anything yet!</h3>
              <p className="text-gray-500 mt-2">Clear out your room and earn some cash by listing items.</p>
              <button 
                onClick={() => navigate('/listings/new')}
                className="mt-6 font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 px-6 py-2 rounded-lg"
              >
                Post your first item
              </button>
            </div>
          ) : (
            listings?.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};
