import type { Category, ListingFilters, ListingType } from '../types/listing';
import { useState, useEffect } from 'react';

interface FilterSidebarProps {
  categories: Category[];
  filters: ListingFilters;
  onChange: (updated: Partial<ListingFilters>) => void;
  onReset: () => void;
}

export const FilterSidebar = ({ categories, filters, onChange, onReset }: FilterSidebarProps) => {
  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() || '');

  // Sync internal state if URL filters change externally
  useEffect(() => {
    setMinPrice(filters.min_price?.toString() || '');
    setMaxPrice(filters.max_price?.toString() || '');
  }, [filters.min_price, filters.max_price]);

  const handlePriceBlur = () => {
    onChange({
      min_price: minPrice ? parseFloat(minPrice) : null,
      max_price: maxPrice ? parseFloat(maxPrice) : null,
      page: 1
    });
  };

  const types: { label: string; value: ListingType | null }[] = [
    { label: 'All', value: null },
    { label: 'Sell', value: 'sell' },
    { label: 'Lend', value: 'lend' },
    { label: 'Free', value: 'free' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button 
          onClick={onReset}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      {/* Type */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-700">Listing Type</h3>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button
              key={t.label}
              onClick={() => onChange({ listing_type: t.value, page: 1 })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filters.listing_type === t.value 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-700">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onBlur={handlePriceBlur}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onBlur={handlePriceBlur}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-gray-700">Categories</h3>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => onChange({ category_id: null, page: 1 })}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition ${
              filters.category_id == null 
                ? 'bg-blue-50 text-blue-700 font-bold' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => onChange({ category_id: c.id, page: 1 })}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                filters.category_id === c.id 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
