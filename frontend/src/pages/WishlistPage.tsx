import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist } from '../api/wishlist';
import { Header } from '../components/Header';
import { ListingCard } from '../components/ListingCard';

export const WishlistPage = () => {
  const [tab, setTab] = useState<'own' | 'other'>('other');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link to="/listings" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Browse Listings
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        
        <div className="flex space-x-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setTab('own')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              tab === 'own' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setTab('other')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              tab === 'other' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Other Listings
          </button>
        </div>
        
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        )}
        
        {isError && (
          <div className="text-center py-12 text-red-600">
            Failed to load wishlist. Please try again.
          </div>
        )}
        
        {data && !isLoading && (
          <div>
            {tab === 'own' ? (
              data.own_listings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                  You haven't wishlisted any of your own listings.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {data.own_listings.map(listing => (
                    <div key={listing.id} onClick={() => queryClient.invalidateQueries({ queryKey: ['wishlist'] })}>
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )
            ) : (
              data.other_listings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                  You haven't saved any listings yet. Browse listings to find something.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {data.other_listings.map(listing => (
                    <div key={listing.id} onClick={() => queryClient.invalidateQueries({ queryKey: ['wishlist'] })}>
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};
