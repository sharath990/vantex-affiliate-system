import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingAffiliates, setPendingAffiliates] = useState([]);
  const [allAffiliates, setAllAffiliates] = useState([]);
  const [downlines, setDownlines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'pending':
          const pendingResponse = await adminAPI.getPendingAffiliates();
          setPendingAffiliates(pendingResponse.data.affiliates);
          break;
        case 'affiliates':
          const affiliatesResponse = await adminAPI.getAllAffiliates();
          setAllAffiliates(affiliatesResponse.data.affiliates);
          break;
        case 'downlines':
          const downlinesResponse = await adminAPI.getAllDownlines();
          setDownlines(downlinesResponse.data.downlines);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveAffiliate(id);
      loadData();
    } catch (error) {
      console.error('Failed to approve affiliate:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectAffiliate(id);
      loadData();
    } catch (error) {
      console.error('Failed to reject affiliate:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Suspended': 'bg-gray-100 text-gray-800',
      'User Only': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', name: 'Pending Approvals', icon: Clock },
              { id: 'affiliates', name: 'All Affiliates', icon: Users },
              { id: 'downlines', name: 'Downlines', icon: UserCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* Pending Affiliates */}
              {activeTab === 'pending' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Pending Affiliate Approvals
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Review and approve new affiliate registrations
                    </p>
                  </div>
                  {pendingAffiliates.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No pending affiliates</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {pendingAffiliates.map((affiliate) => (
                        <li key={affiliate.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                  {affiliate.full_name}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  {getStatusBadge(affiliate.status)}
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    {affiliate.email}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    MT5: {affiliate.mt5_rebate_account}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <p>Registered: {formatDate(affiliate.created_at)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => handleApprove(affiliate.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(affiliate.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* All Affiliates */}
              {activeTab === 'affiliates' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      All Affiliates
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Affiliate Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allAffiliates.map((affiliate) => (
                          <tr key={affiliate.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {affiliate.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {affiliate.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {affiliate.affiliate_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(affiliate.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(affiliate.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Downlines */}
              {activeTab === 'downlines' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      All Downlines
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sub1 (Direct)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sub2 (Upline)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {downlines.map((downline) => (
                          <tr key={downline.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {downline.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {downline.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {downline.sub1_name} ({downline.sub1_code})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {downline.sub2_name ? `${downline.sub2_name} (${downline.sub2_code})` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(downline.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;