import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { FilterSidebar } from '../components/FilterSidebar';
import { ListingCard } from '../components/ListingCard';
import { fetchCategories, fetchListings } from '../api/listings';
import type { ListingFilters, ListingType } from '../types/listing';

export const BrowsePage = () => {
  
  // Custom hook to handle React Router's search params only on mount and when changed
  const [routerParams, setRouterParams] = useSearchParams();

  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    per_page: 20,
    status: 'active',
  });

  // Initialize from URL on mount
  useEffect(() => {
    const initialFilters: ListingFilters = { page: 1, per_page: 20, status: 'active' };
    
    if (routerParams.has('page')) initialFilters.page = parseInt(routerParams.get('page')!, 10);
    if (routerParams.has('category_id')) initialFilters.category_id = parseInt(routerParams.get('category_id')!, 10);
    if (routerParams.has('listing_type')) initialFilters.listing_type = routerParams.get('listing_type') as ListingType;
    if (routerParams.has('min_price')) initialFilters.min_price = parseFloat(routerParams.get('min_price')!);
    if (routerParams.has('max_price')) initialFilters.max_price = parseFloat(routerParams.get('max_price')!);
    if (routerParams.has('q')) {
      initialFilters.q = routerParams.get('q');
    }
    
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.page && filters.page > 1) newParams.set('page', filters.page.toString());
    if (filters.category_id) newParams.set('category_id', filters.category_id.toString());
    if (filters.listing_type) newParams.set('listing_type', filters.listing_type);
    if (filters.min_price) newParams.set('min_price', filters.min_price.toString());
    if (filters.max_price) newParams.set('max_price', filters.max_price.toString());
    if (filters.q) newParams.set('q', filters.q);
    
    setRouterParams(newParams, { replace: true });
  }, [filters, setRouterParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,
  });

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
    placeholderData: (prev) => prev,
  });

  const handleFilterChange = (updated: Partial<ListingFilters>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFilters({ page: 1, per_page: 20, status: 'active' });
  };

  const skeletons = Array(8).fill(0);

  return (
    <div className="min-h-screen bg-[#f8f5fd] flex flex-col">
      <Header />
      
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full shrink-0 md:w-64">
            <FilterSidebar 
              categories={categories}
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Feed */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {filters.q ? `Search results for "${filters.q}"` : 'All Listings'}
              </h1>
              {data && (
                <span className="text-sm font-medium text-gray-500">{data.total} results</span>
              )}
            </div>

            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-50' : ''}`}>
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
              ) : data?.listings.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-gray-900">No listings found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={handleReset}
                    className="mt-4 text-primary-600 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                data?.listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={!data.has_prev}
                  onClick={() => handleFilterChange({ page: data.page - 1 })}
                  className="rounded-lg border px-4 py-2 font-medium text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page {data.page} of {data.pages}
                </span>
                <button
                  disabled={!data.has_next}
                  onClick={() => handleFilterChange({ page: data.page + 1 })}
                  className="rounded-lg border px-4 py-2 font-medium text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
