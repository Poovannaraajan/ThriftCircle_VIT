import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchCategories, createListing } from '../api/listings';
import { parseApiError } from '../utils/errors';
import { useToast } from '../contexts/ToastContext';
import type { Category, ListingType, ListingCondition } from '../types/listing';

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => showToast(parseApiError(err), 'error'));
  }, [showToast]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(URL.revokeObjectURL);
    };
  }, [previewUrls]);

  // Phone Gate
  if (!user?.phone_number) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5fd] p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Phone Number Required</h2>
          <p className="mb-6 text-gray-600">You must set your phone number before creating a listing.</p>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    const remainingSlots = 4 - images.length;
    const newFiles = validFiles.slice(0, remainingSlots);
    
    if (newFiles.length > 0) {
      setImages(prev => [...prev, ...newFiles]);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submit block
    
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

    if (images.length === 0) {
      setError('Please upload at least 1 image of the item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDesc || undefined,
        price: formData.listing_type === 'free' ? null : (price ? parseFloat(price) : null),
        listing_type: formData.listing_type as ListingType,
        rental_period: formData.rental_period,
        condition: condition || null,
        category_id: parseInt(categoryId, 10)
      };

      const listing = await createListing(payload, images);
      showToast("Listing created successfully!", "success");
      navigate(`/listings`);
    } catch (err: unknown) {
      const errMsg = parseApiError(err);
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Post a Listing</h1>
        <button 
          onClick={() => navigate('/listings')}
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
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                listing_type: type, 
                rental_period: type === 'lend' ? 'day' : null 
              }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, rental_period: e.target.value as 'day' | 'week' | 'month' }))}
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

        {/* Images */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Photos ({images.length}/4) *
          </label>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
                <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {images.length < 4 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-[#f8f5fd] transition hover:bg-gray-100 hover:border-primary-400 text-gray-500">
                <span className="text-2xl">+</span>
                <span className="text-xs font-medium mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary-600 py-4 text-center font-bold text-white shadow-md transition hover:bg-primary-700 disabled:bg-primary-300"
        >
          {isSubmitting ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
};
