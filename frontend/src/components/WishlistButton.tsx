import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

interface WishlistButtonProps {
  listing_id: string;
  size?: 'sm' | 'md';
}

export const WishlistButton = ({ listing_id, size = 'sm' }: WishlistButtonProps) => {
  const { wishlistIds, toggle, isLoading: contextLoading } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const isWishlisted = wishlistIds.has(listing_id);
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showToast('Sign in to save listings', 'error');
      return;
    }
    
    if (isToggling || contextLoading) return;
    
    setIsToggling(true);
    await toggle(listing_id);
    setIsToggling(false);
  };

  const containerClasses = size === 'sm' 
    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95'
    : 'flex h-12 w-12 items-center justify-center rounded-xl border-2 border-gray-100 bg-white shadow-sm transition-all hover:border-red-100 hover:bg-red-50 active:scale-95';

  const iconClasses = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <button 
      onClick={handleClick} 
      className={containerClasses}
      disabled={isToggling || contextLoading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isToggling ? (
        <svg className={`animate-spin text-gray-400 ${iconClasses}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isWishlisted ? (
        <svg className={`${iconClasses} text-red-500 transform transition-transform duration-200 scale-110`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg className={`${iconClasses} text-gray-400 hover:text-red-400 transition-colors duration-200`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
};
