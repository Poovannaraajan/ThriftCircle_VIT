import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { fetchWishlistIds, addToWishlist, removeFromWishlist } from '../api/wishlist';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

interface WishlistContextType {
  wishlistIds: Set<string>;
  isLoading: boolean;
  toggle: (listing_id: string) => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      if (!user) {
        setWishlistIds(new Set());
        setIsLoading(false);
        return;
      }

      try {
        const ids = await fetchWishlistIds();
        if (isMounted) {
          setWishlistIds(new Set(ids));
        }
      } catch (error) {
        console.error("Failed to fetch wishlist IDs", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggle = async (listing_id: string) => {
    if (!user) return;

    const isWishlisted = wishlistIds.has(listing_id);

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (isWishlisted) next.delete(listing_id);
      else next.add(listing_id);
      return next;
    });

    try {
      if (isWishlisted) {
        await removeFromWishlist(listing_id);
      } else {
        await addToWishlist(listing_id);
      }
    } catch (error: any) {
      // Revert on failure
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (isWishlisted) next.add(listing_id);
        else next.delete(listing_id);
        return next;
      });
      showToast(error.response?.data?.error || "Failed to update wishlist", "error");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoading, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
