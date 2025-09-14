'use client';

import { useState, useEffect } from 'react';
import { getUser, getToken, logout } from '../../lib/auth';
import { notesApi, tenantsApi, upgradeApi } from '../../lib/api';
import Link from 'next/link';

export default function NotesPage() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeRequest, setUpgradeRequest] = useState(null);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    
    if (!token || !userData) {
      window.location.href = '/';
      return;
    }
    
    setUser(userData);
    loadNotes();
    loadUpgradeStatus();
    
    // Auto-open upgrade modal if trial expired
    if (userData.tenant.subscription_plan === 'free' && userData.tenant.notes_created_count >= 3) {
      setTimeout(() => setShowUpgradeModal(true), 500);
    }
  }, []);

  const loadNotes = async () => {
    try {
      const data = await notesApi.getAll();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUpgradeStatus = async () => {
    try {
      const status = await upgradeApi.getStatus();
      setUpgradeRequest(status);
    } catch (err) {
      console.error('Failed to load upgrade status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await notesApi.update(editingId, formData);
      } else {
        await notesApi.create(formData);
      }
      
      setFormData({ title: '', content: '' });
      setShowForm(false);
      setEditingId(null);
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setEditingId(note.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.delete(id);
      loadNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpgrade = async () => {
    try {
      await tenantsApi.upgrade(user.tenant.slug);
      const userData = getUser();
      userData.tenant.subscription_plan = 'pro';
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const canCreateNote = user?.tenant.subscription_plan === 'pro' || (user?.tenant.subscription_plan === 'free' && user?.tenant.notes_created_count < 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
                <p className="text-sm text-gray-600">
                  {user?.email} • {user?.tenant.slug} • 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user?.tenant.subscription_plan === 'pro' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.tenant.subscription_plan} plan
                    {user?.tenant.subscription_plan === 'free' && (
                      <span className="ml-1">({user?.tenant.notes_created_count}/3 used)</span>
                    )}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      👑 Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors text-sm"
                >
                  🛡️ Admin Dashboard
                </Link>
              )}
              {user?.tenant.subscription_plan === 'free' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  ⚡ Upgrade to Pro
                </button>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Upgrade Banner */}
        {user?.tenant.subscription_plan === 'free' && user?.tenant.notes_created_count >= 3 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Free Plan Limit Reached</h3>
                  <p className="text-gray-600">You've reached the maximum of 3 notes on the free plan.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/upgrade"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 inline-block"
                >
                  View Upgrade Options
                </Link>
                {user?.role === 'admin' && (
                  <button
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
                  >
                    Quick Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Note Button */}
        <div className="mb-8">
          {canCreateNote && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Note
              </div>
            </button>
          )}
          
          {!canCreateNote && (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Plan Limit Reached</h3>
                <p className="text-gray-600 mb-4">You've used all 3 free notes. Upgrade to Pro for unlimited notes!</p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={upgradeRequest?.status === 'pending'}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {upgradeRequest?.status === 'pending' ? 'Upgrade Request Pending' : 'Request Pro Upgrade'}
                </button>
                {upgradeRequest?.status === 'pending' && (
                  <p className="text-sm text-yellow-600 mt-2">
                    🕰️ Your upgrade request is pending admin approval
                  </p>
                )}
                {upgradeRequest?.status === 'rejected' && (
                  <p className="text-sm text-red-600 mt-2">
                    ❌ Your upgrade request was rejected. Contact admin for details.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Note Form */}
          {showForm && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Note title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Write your note content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-32 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
                  >
                    {editingId ? 'Update Note' : 'Save Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ title: '', content: '' });
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{note.title}</h3>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-4 line-clamp-4">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                {note.created_by_email && user?.role === 'admin' && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {note.created_by_email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {notes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">Create your first note to get started!</p>
            {canCreateNote && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                Create Your First Note
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal with Payment */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🚀 Upgrade to Pro
              </h3>
              
              <p className="text-gray-600 mb-4">
                You've reached the 3 note limit. Upgrade for unlimited notes!
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">$9.99<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600">Pro Plan</p>
              </div>
              
              <div className="space-y-3">
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
                  <span className="text-gray-700">Advanced features</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Team collaboration</span>
                </div>
              </div>
            </div>

            {/* Request Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-medium text-blue-900">How it works</h4>
              </div>
              <p className="text-blue-800 text-sm">
                Your upgrade request will be sent to your admin for approval. Once approved, you'll get instant access to Pro features.
              </p>
            </div>
              
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await upgradeApi.createRequest();
                    setShowUpgradeModal(false);
                    alert('Upgrade request sent to admin! 📧');
                    loadUpgradeStatus();
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || upgradeRequest?.status === 'pending'}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Sending...' : upgradeRequest?.status === 'pending' ? 'Request Pending' : 'Request Upgrade'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              📬 Request will be sent to your admin for approval
            </p>
          </div>
        </div>
      )}
    </div>
  );
}