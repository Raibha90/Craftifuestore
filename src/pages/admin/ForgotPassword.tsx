import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError('Failed to send reset email. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your admin email to receive reset instructions.</p>
        </div>

        {error && <p className="mb-4 text-xs text-red-500 text-center bg-red-50 p-3 rounded-full">{error}</p>}
        {message && <p className="mb-4 text-xs text-green-600 text-center bg-green-50 p-3 rounded-full">{message}</p>}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@craftique.store"
              className="w-full pl-14 pr-6 py-4 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
