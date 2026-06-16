import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { parseApiError } from '../utils/errors';

export const PhoneNumberModal = () => {
  const { updatePhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePhone(phone);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Almost there!</h2>
        <p className="mb-6 text-gray-600">Please provide your phone number to continue. This will be used by buyers to contact you.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className={`w-full rounded-lg border p-3 pl-12 text-gray-900 outline-none transition-all ${
                  error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                }`}
                placeholder="9876543210"
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || phone.length !== 10}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-600 p-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-primary-300"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
