import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchCategories, updateListingDetails } from '../api/listings';
import { parseApiError } from '../utils/errors';
import { useToast } from '../contexts/ToastContext';
import type { Category, ListingCondition, CreateListingPayload } from '../types/listing';
import api from '../api/axios';

export const EditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<CreateListingPayload>>({
    listing_type: 'sell',
    rental_period: null,
  });
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition | ''>('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => showToast(parseApiError(err), 'error'));
  }, [showToast]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/listings/${id}`);
        const listing = response.data;
        
        if (listing.seller_id !== user?.id) {
          showToast("You can only edit your own listings", "error");
          navigate('/my-listings');
          return;
        }

        setFormData({
          title: listing.title,
          description: listing.description || '',
          price: listing.price,
          listing_type: listing.listing_type,
          rental_period: listing.rental_period || null,
          condition: listing.condition,
          category_id: listing.category?.id,
        });
        setTitle(listing.title);
        setDescription(listing.description || '');

        setCategoryId(listing.category_id.toString());
        setCondition(listing.condition || '');
        setPrice(listing.price ? listing.price.toString() : '');
        
      } catch (err) {
        showToast(parseApiError(err), 'error');
        navigate('/my-listings');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) {
      fetchListing();
    }
  }, [id, user, navigate, showToast]);

  // Phone Gate
  if (!user?.phone_number) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5fd] p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Phone Number Required</h2>
          <p className="mb-6 text-gray-600">You must set your phone number before editing a listing.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !id) return;
    
    setError('');

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle || !categoryId || !condition || !trimmedDesc) {
      setError('All fields (Title, Category, Condition, Description) are required.');
      return;
    }

    if (formData.listing_type !== 'free' && !price) {
      setError('Price is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDesc || undefined,
        price: formData.listing_type === 'free' ? null : (price ? parseFloat(price) : null),
        listing_type: formData.listing_type,
        rental_period: formData.listing_type === 'lend' ? formData.rental_period : null,
        condition: condition || null,
        category_id: parseInt(categoryId, 10)
      };

      await updateListingDetails(id, payload);
      showToast("Listing updated successfully!", "success");
      navigate(`/my-listings`);
    } catch (err: unknown) {
      const errMsg = parseApiError(err);
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5fd]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <button 
          onClick={() => navigate('/my-listings')}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#f8f5fd]"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        
        {/* Type Toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-[#f8f5fd] p-1">
          {(['sell', 'lend', 'free'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData((prev: Partial<CreateListingPayload>) => ({ ...prev, listing_type: type, rental_period: type === 'lend' ? 'day' : null }))}
              className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition-all ${
                formData.listing_type === type 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            placeholder="What are you listing?"
            required
          />

          <div className="mt-1 text-right text-xs text-gray-400">{title.length}/120</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              required
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ListingCondition)}
              className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              required
            >
              <option value="" disabled>Select condition</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Price (Hidden if Free) */}
        {formData.listing_type !== 'free' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder={formData.listing_type === 'sell' ? 'Selling price' : 'Lending rate'}
              />
            </div>
            {formData.listing_type === 'lend' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rental Period *</label>
                <select
                  required
                  value={formData.rental_period || 'day'}
                  onChange={e => setFormData((prev: Partial<CreateListingPayload>) => ({ ...prev, rental_period: e.target.value as 'day' | 'week' | 'month' }))}
                  className="w-full rounded-lg border border-gray-300 p-3 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="day">Per Day</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            required
            maxLength={2000}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
            placeholder="Add more details about your item..."
          />
          <div className="mt-1 text-right text-xs text-gray-400">{description.length}/2000</div>
        </div>

        <div className="rounded-lg bg-primary-50 p-4 border border-primary-100 flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-primary-800">
            <strong>Note:</strong> Image editing is currently not supported during listing updates. 
            To change images, please delete this listing and create a new one.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary-600 py-4 text-center font-bold text-white shadow-md transition hover:bg-primary-700 disabled:bg-primary-300"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
