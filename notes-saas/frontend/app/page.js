'use client';

import { useState } from 'react';
import { login, setToken, setUser } from '../lib/auth';
import Link from 'next/link';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      setToken(response.token);
      setUser(response.user);
      window.location.href = '/notes';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Dynamic Island Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-white/10">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">NotesFlow</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-white text-sm transition-colors">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-white text-sm transition-colors">Pricing</a>
              <Link href="/signup" className="text-white/80 hover:text-white text-sm transition-colors">Sign up</Link>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-20 h-20 bg-purple-200 rounded-lg rotate-12 opacity-60"></div>
          <div className="absolute top-40 right-40 w-4 h-4 bg-blue-400 rounded-full"></div>
          <div className="absolute top-60 right-60 w-2 h-8 bg-yellow-400 rounded-full rotate-45"></div>
          <div className="absolute bottom-40 right-32 w-6 h-6 bg-purple-400 rounded-full"></div>
          <div className="absolute bottom-60 right-80 w-8 h-8 bg-orange-300 rounded-lg rotate-45"></div>
          <svg className="absolute top-1/2 right-1/4 w-32 h-32 text-purple-200 opacity-50" fill="currentColor" viewBox="0 0 100 100">
            <path d="M20,50 Q50,20 80,50 Q50,80 20,50" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <svg className="absolute bottom-1/4 right-1/3 w-24 h-24 text-blue-200 opacity-50" fill="currentColor" viewBox="0 0 100 100">
            <path d="M30,30 Q70,30 70,70 Q30,70 30,30" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">NotesFlow</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Note Taking Mobile App
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </Link>
                <button
                  onClick={() => setShowLogin(true)}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-purple-400 hover:text-purple-600 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right - Mobile Mockups */}
            <div className="relative">
              <div className="flex justify-center items-center space-x-4">
                {/* Phone 1 */}
                <div className="transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  <div className="w-64 h-[500px] bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-b from-purple-900 via-blue-900 to-black rounded-[2.5rem] p-4 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-white text-sm font-medium">9:41</span>
                        <div className="flex space-x-1">
                          <div className="w-4 h-2 bg-white rounded-sm"></div>
                          <div className="w-1 h-2 bg-white rounded-sm"></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-purple-600/30 rounded-2xl p-4 backdrop-blur-sm">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg"></div>
                            <span className="text-white font-medium">All Note</span>
                          </div>
                          <p className="text-purple-200 text-sm">Start a free trial</p>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <span className="text-white text-sm">Shopping List</span>
                          </div>
                          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <span className="text-white text-sm">Meeting Notes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone 2 */}
                <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="w-64 h-[500px] bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-b from-blue-900 via-purple-900 to-black rounded-[2.5rem] p-4 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-white text-sm font-medium">9:41</span>
                        <div className="flex space-x-1">
                          <div className="w-4 h-2 bg-white rounded-sm"></div>
                          <div className="w-1 h-2 bg-white rounded-sm"></div>
                        </div>
                      </div>
                      <div className="text-center mb-6">
                        <h3 className="text-white text-lg font-semibold">Form Library</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4">
                          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white rounded-lg"></div>
                          </div>
                          <p className="text-white text-center text-sm">My Form</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-xl text-gray-600">Powerful features for modern teams</p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure & Private</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Enterprise-grade security with multi-tenant isolation keeps your data safe.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Team Collaboration</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Admin controls and user management for seamless teamwork.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Lightning Fast</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Create and access your notes instantly with our optimized platform.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Analytics</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Track usage and insights with detailed analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more.
            </p>
          </div>
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Free</h2>
                <p className="mt-4 text-sm text-gray-500">Perfect for trying out NotesFlow</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$0</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <Link
                  href="/signup"
                  className="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900 transition-colors"
                >
                  Get started
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">3 notes included</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Basic features</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Email support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Pro</h2>
                <p className="mt-4 text-sm text-gray-500">For growing teams and businesses</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <Link
                  href="/signup"
                  className="mt-8 block w-full bg-blue-600 border border-blue-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700 transition-colors"
                >
                  Start trial
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Unlimited notes</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Advanced features</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Team collaboration</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sign In</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <Link href="/signup" className="text-blue-600 hover:text-blue-800">
                Don't have an account? Sign up
              </Link>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <p className="font-medium mb-2">Test Accounts:</p>
              <p>👑 admin@acme.test / password</p>
              <p>👤 user@acme.test / password</p>
              <p>👑 admin@globex.test / password</p>
              <p>👤 user@globex.test / password</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}