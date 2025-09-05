import { useState } from 'react';
import { affiliateAPI } from '../utils/api';

const AffiliateRegistration = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mt5_rebate_account: '',
    contact_details: '',
    ox_ib_link: ''
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
      const response = await affiliateAPI.register(formData);
      setSuccess(true);
      setMessage(`Registration successful! Your affiliate code is: ${response.data.affiliate_code}`);
      setFormData({
        full_name: '',
        email: '',
        mt5_rebate_account: '',
        contact_details: '',
        ox_ib_link: ''
      });
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Vantex Affiliate Registration
          </h2>
          <p className="text-gray-600 mb-8">
            Join our affiliate program and start earning
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
                Full Name *
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
                Email Address *
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                MT5 Rebate Account Number *
              </label>
              <input
                type="text"
                name="mt5_rebate_account"
                required
                value={formData.mt5_rebate_account}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Details
              </label>
              <textarea
                name="contact_details"
                value={formData.contact_details}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ox IB Link
              </label>
              <input
                type="url"
                name="ox_ib_link"
                value={formData.ox_ib_link}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Affiliate'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p>* Required fields</p>
            <p className="mt-2">
              Note: You must first apply for an IB account via Ox Securities before registering here.
            </p>
          </div>

          <div className="mt-6 text-center">
            <a href="/downlines" className="text-blue-600 hover:text-blue-500 text-sm">
              Already an affiliate? Add Downlines →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateRegistration;