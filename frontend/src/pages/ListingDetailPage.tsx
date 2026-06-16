import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { fetchListing, getImageUrl, updateListingStatus, deleteListing } from '../api/listings';
import { parseApiError } from '../utils/errors';
import type { ListingStatus } from '../types/listing';
import { useAuth } from '../hooks/useAuth';
import { SignInOverlay } from '../components/SignInOverlay';
import { useToast } from '../contexts/ToastContext';
import { PhoneNumberModal } from '../components/PhoneNumberModal';
import { WishlistButton } from '../components/WishlistButton';

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

export const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (newStatus: ListingStatus) => updateListingStatus(id!, newStatus),
    onSuccess: () => {
      setStatusError(null);
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
    },
    onError: (err) => setStatusError(parseApiError(err)),
  });

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  });

  const isLoggedIn = user !== null;
  const isOwner = user?.id === listing?.seller_id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5fd]">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex animate-pulse flex-col gap-8 md:flex-row">
            <div className="aspect-square w-full rounded-2xl bg-gray-200 md:w-1/2"></div>
            <div className="w-full space-y-4 md:w-1/2">
              <div className="h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-6 w-1/4 rounded bg-gray-200"></div>
              <div className="mt-8 h-32 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // @ts-ignore
  if (error?.response?.status === 404 || !listing) {
    return (
      <div className="min-h-screen bg-[#f8f5fd] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Listing not found</h2>
            <p className="text-gray-500 mt-2 mb-6">This listing doesn't exist or has been removed.</p>
            <Link to="/listings" className="text-primary-600 font-medium hover:underline">
              ← Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const typeColor = {
    sell: 'bg-primary-100 text-primary-800',
    lend: 'bg-purple-100 text-purple-800',
    free: 'bg-green-100 text-green-800',
  }[listing.listing_type];

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    sold: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  }[listing.status];

  return (
    <div className="min-h-screen bg-[#f8f5fd]">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back
        </button>

        <div className="flex flex-col gap-8 md:flex-row lg:gap-12">
          
          {/* Images */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-200">
              {listing.image_urls.length > 0 ? (
                <img 
                  src={getImageUrl(listing.image_urls[selectedIndex])} 
                  alt={listing.title} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl opacity-50">
                  {listing.category?.icon || '📦'}
                </div>
              )}
            </div>
            
            {listing.image_urls.length > 1 && (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {listing.image_urls.map((url, idx) => (
                  <button
                    key={url}
                    onClick={() => setSelectedIndex(idx)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                      selectedIndex === idx ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={getImageUrl(url)} 
                      alt={`Thumbnail ${idx}`} 
                      className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex w-full flex-col md:w-1/2">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${typeColor}`}>
                {listing.listing_type}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                {listing.status}
              </span>
              {listing.category && (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                  {listing.category.icon} {listing.category.name}
                </span>
              )}
              {listing.condition && (
                <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 capitalize">
                  {listing.condition.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-gray-500 flex items-center gap-2">
                  <span>Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">{listing.category?.icon} {listing.category?.name}</span>
                </p>
              </div>
              <div className="shrink-0 pt-1">
                <WishlistButton listing_id={listing.id} size="md" />
              </div>
            </div>
            
            <div className="my-6 text-2xl font-bold text-gray-900">
              {listing.listing_type === 'free' 
                ? 'FREE' 
                : listing.price === null 
                  ? 'Price on request' 
                  : `₹${listing.price.toLocaleString('en-IN')}`
              }
            </div>

            {listing.description && (
              <div className="mb-8 whitespace-pre-wrap text-gray-700 text-base leading-relaxed">
                {listing.description}
              </div>
            )}

            {/* Seller Section */}
            <div className="mt-auto border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Seller Details</h3>
              
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  {listing.seller?.avatar_url ? (
                    <img src={listing.seller.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full border border-gray-200" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                      {listing.seller?.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{listing.seller?.name}</h3>
                    <p className="text-sm text-gray-500">
                      VIT Student {isLoggedIn && listing.seller?.reg_no && `• ${listing.seller.reg_no}`}
                    </p>
                  </div>
                </div>

                {!isLoggedIn ? (
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="w-full rounded-lg bg-primary-50 py-3 font-semibold text-primary-700 hover:bg-primary-100 transition"
                  >
                    🔒 Sign in to view contact details
                  </button>
                ) : isOwner ? (
                  <div className="rounded-lg bg-[#f8f5fd] p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manage Status</label>
                    <select
                      value={listing.status}
                      disabled={statusMutation.isPending || listing.status === 'sold'}
                      onChange={(e) => statusMutation.mutate(e.target.value as ListingStatus)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-medium bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="active">Active</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold" disabled={listing.status !== 'reserved' && listing.status !== 'sold'}>Sold</option>
                      <option value="expired" disabled={listing.status === 'sold'}>Expired (Close listing)</option>
                    </select>
                    {statusError && (
                      <p className="mt-2 text-xs font-medium text-red-600">{statusError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg bg-primary-50 p-4 border border-primary-100">
                    <div className="flex items-center gap-3 text-gray-800">
                      <span className="text-xl">📧</span>
                      <a href={`mailto:${listing.seller?.email}`} className="font-medium hover:text-primary-600 hover:underline">
                        {listing.seller?.email || 'Not provided'}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <span className="text-xl">📱</span>
                      <a href={`tel:${listing.seller?.phone_number}`} className="font-medium hover:text-primary-600 hover:underline">
                        {listing.seller?.phone_number || 'Not provided'}
                      </a>
                    </div>
                    <p className="mt-3 text-xs font-medium text-primary-800 border-t border-primary-200 pt-3">
                      Reach out directly to the seller. For your safety, always meet in a public place on campus.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Posted {timeAgo(listing.created_at)}</span>
              <span>Expires in {daysUntil(listing.expires_at)} days</span>
            </div>
          </div>
        </div>
      </main>

      <SignInOverlay isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};
