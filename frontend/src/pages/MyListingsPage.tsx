import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { fetchMyListings, updateListingStatus, getImageUrl } from '../api/listings';
import { parseApiError } from '../utils/errors';
import type { Listing, ListingStatus } from '../types/listing';

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

const ListingRow = ({ listing }: { listing: Listing }) => {
  const queryClient = useQueryClient();
  const [statusError, setStatusError] = useState<string | null>(null);
  
  const statusMutation = useMutation({
    mutationFn: (newStatus: ListingStatus) => updateListingStatus(listing.id, newStatus),
    onSuccess: () => {
      setStatusError(null);
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: (err) => setStatusError(parseApiError(err)),
  });

  const isSold = listing.status === 'sold';
  const isExpired = listing.status === 'expired';
  const isReserved = listing.status === 'reserved';
  
  const daysLeft = daysUntil(listing.expires_at);
  const mainImage = listing.image_urls.length > 0 ? getImageUrl(listing.image_urls[0]) : null;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-100 last:border-0 bg-white transition-all ${isSold ? 'opacity-60 grayscale-[50%]' : ''}`}>
      {/* Cover Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
        {mainImage ? (
          <img src={mainImage} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl opacity-40">{listing.category?.icon || '📦'}</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`truncate font-bold text-lg ${isSold ? 'text-gray-500' : 'text-gray-900'}`}>
            {listing.title}
          </h3>
          <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {listing.listing_type}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 mb-2">
          <span className="font-bold text-gray-900">
            {listing.listing_type === 'free' 
                ? 'FREE' 
                : listing.price === null 
                  ? 'Price on request' 
                  : `₹${listing.price.toLocaleString('en-IN')}`}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1">
            {listing.category?.icon} {listing.category?.name}
          </span>
          {listing.condition && (
            <>
              <span className="text-gray-300">•</span>
              <span className="capitalize">{listing.condition.replace('_', ' ')}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-gray-400">Posted {timeAgo(listing.created_at)}</span>
          <span className="text-gray-300">•</span>
          <span className={
            isExpired ? 'text-red-600 font-bold' : 
            daysLeft <= 7 ? 'text-amber-600 font-bold' : 
            'text-gray-400'
          }>
            {isExpired ? 'Expired' : `Expires in ${daysLeft} days`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-3 shrink-0 mt-4 sm:mt-0 w-full sm:w-auto">
        <div className="flex-1 sm:w-48">
          <div className="relative">
            <select
              value={listing.status}
              disabled={statusMutation.isPending || isSold}
              onChange={(e) => statusMutation.mutate(e.target.value as ListingStatus)}
              className={`w-full appearance-none rounded-lg border py-2.5 pl-3 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isReserved ? 'border-amber-300 bg-amber-50 text-amber-900' :
                isExpired ? 'border-red-200 bg-red-50 text-red-900' :
                'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <option value="active">Active</option>
              <option value="reserved">Reserved</option>
              <option value="sold" disabled={!isReserved && !isSold}>Sold</option>
              <option value="expired" disabled={isSold}>Expired (Close)</option>
            </select>
            
            {statusMutation.isPending ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            )}
          </div>
          {statusError && <p className="mt-1.5 text-[11px] font-bold text-red-600 leading-tight">{statusError}</p>}
        </div>
        
        <Link 
          to={`/listings/${listing.id}`}
          className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200 transition whitespace-nowrap"
        >
          View →
        </Link>
      </div>
    </div>
  );
};

export const MyListingsPage = () => {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  });

  const skeletons = Array(3).fill(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/listings')} 
              className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Listings</h1>
          </div>
          <button
            onClick={() => navigate('/listings/new')}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition hidden sm:block"
          >
            + Post New Item
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {skeletons.map((_, i) => (
                <div key={i} className="flex p-4 gap-4 animate-pulse">
                  <div className="h-20 w-20 rounded-lg bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/5 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings?.length === 0 ? (
            <div className="py-24 text-center px-4">
              <div className="text-7xl mb-6">📦</div>
              <h3 className="text-xl font-bold text-gray-900">You haven't listed anything yet!</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">Clear out your room and earn some cash by listing items for your campus peers.</p>
              <button 
                onClick={() => navigate('/listings/new')}
                className="mt-8 font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-8 py-3 rounded-xl transition"
              >
                Post your first item
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {listings?.map(listing => (
                <ListingRow key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
