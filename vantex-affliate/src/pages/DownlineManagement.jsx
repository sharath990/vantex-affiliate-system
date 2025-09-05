import { useState } from 'react';
import { affiliateAPI } from '../utils/api';

const DownlineManagement = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    affiliate_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await affiliateAPI.addDownline(formData);
      setSuccess(true);
      setMessage('Downline added successfully!');
      setFormData({
        full_name: '',
        email: '',
        affiliate_code: ''
      });
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || 'Failed to add downline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Add Downline
          </h2>
          <p className="text-gray-600 mb-8">
            Add a new downline to your affiliate network
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {message && (
            <div className={`mb-4 p-4 rounded ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Affiliate Code *
              </label>
              <input
                type="text"
                name="affiliate_code"
                required
                value={formData.affiliate_code}
                onChange={handleChange}
                placeholder="VTX00001"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Downline Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Downline Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Downline'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-500 text-sm">
              ← Back to Registration
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownlineManagement;