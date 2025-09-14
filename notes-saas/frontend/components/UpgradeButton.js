'use client';

import { useState, useEffect } from 'react';
import { getUser } from '../lib/auth';
import { tenantsApi } from '../lib/api';

export default function UpgradeButton() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await tenantsApi.upgrade(user.tenant.slug);
      
      // Update user data
      const userData = getUser();
      userData.tenant.subscription_plan = 'pro';
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setShowModal(false);
      window.location.reload(); // Refresh to update UI
    } catch (err) {
      alert('Upgrade failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.tenant.subscription_plan === 'pro') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-110 transition-all duration-200 shadow-lg z-40 animate-pulse"
      >
        ⚡ Upgrade to Pro
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Upgrade to Pro
              </h3>
              
              <div className="text-left bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Pro Features:</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Unlimited notes</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Advanced search & tags</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Export & backup</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Priority support</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">$9.99</div>
                <div className="text-gray-600">per month</div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                
                {user?.role === 'admin' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                ) : (
                  <div className="flex-1 text-center">
                    <p className="text-sm text-gray-600 mb-2">Only admins can upgrade</p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-gray-300 text-gray-600 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      Contact Admin
                    </button>
                  </div>
                )}\n              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}