
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon } from '../components/icons';

const CustomerLoginPage: React.FC = () => {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(res => setTimeout(res, 1000));

    const result = await login(customerId, password);
    if (!result.success) {
      setError(result.reason || 'Invalid Customer ID or Password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Customer Sign In</h1>
        <p className="text-center text-gray-400 mb-8">Access your Fifth Baptist Bank accounts.</p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-start gap-3" role="alert">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-1"/>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="customer-id">
              Customer ID
            </label>
            <input
              id="customer-id"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="e.g., 11223344"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Forgot your ID or Password? <a href="#" className="text-cyan-400 hover:underline">Get Help</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
