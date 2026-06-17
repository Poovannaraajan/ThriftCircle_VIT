import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '../types/listing';
import { getImageUrl } from '../api/listings';
import { useAuth } from '../hooks/useAuth';
import { WishlistButton } from './WishlistButton';
import { SignInOverlay } from './SignInOverlay';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);

  const mainImage = listing.image_urls.length > 0 
    ? getImageUrl(listing.image_urls[0]) 
    : null;

  const typeColor = {
    sell: 'bg-primary-100 text-primary-800',
    lend: 'bg-purple-100 text-purple-800',
    free: 'bg-green-100 text-green-800',
  }[listing.listing_type];

  // Stop propagation so clicking "View Contact" doesn't trigger the card's Link
  const handleViewContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSignIn(true);
  };

  return (
    <>
      <div 
        onClick={() => navigate(`/listings/${listing.id}`)}
        className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={listing.title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl opacity-50">
              {listing.category?.icon || '📦'}
            </div>
          )}
          <span className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${typeColor}`}>
            {listing.listing_type}
          </span>
          
          {/* Wishlist Button Overlay */}
          <div 
            className="absolute right-3 top-3 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <WishlistButton listing_id={listing.id} size="sm" />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-primary-600">
              {listing.title}
            </h3>
            <span className="shrink-0 text-base font-bold text-gray-900">
              {listing.listing_type === 'free' 
                ? 'FREE' 
                : listing.price === null 
                  ? 'Price on request' 
                  : `₹${listing.price.toLocaleString('en-IN')}${listing.listing_type === 'lend' && listing.rental_period ? ` / ${listing.rental_period}` : ''}`
              }
            </span>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              {listing.seller?.avatar_url ? (
                <img src={listing.seller.avatar_url} alt={listing.seller.name} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                  {listing.seller?.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium text-gray-700 truncate">
                {listing.seller?.name}
                {user && listing.seller?.reg_no && ` • ${listing.seller.reg_no}`}
              </span>
            </div>

            {user ? (
              <div className="rounded bg-[#f8f5fd] p-2 text-xs">
                <div className="truncate text-gray-700">📧 {listing.seller?.email || 'N/A'}</div>
                <div className="text-gray-700">📱 {listing.seller?.phone_number || 'N/A'}</div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleViewContact}
                className="w-full rounded bg-gray-100 py-1.5 text-xs font-medium text-primary-600 hover:bg-gray-200 transition"
              >
                View Contact
              </button>
            )}
          </div>
        </div>
      </div>

      <SignInOverlay isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
};
