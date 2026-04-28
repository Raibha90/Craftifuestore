import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/30 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="mb-12">
          <Link to="/login" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-olive hover:text-brand-gold transition-colors">
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Options
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-sm border border-brand-olive/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <h2 className="text-3xl font-serif font-bold text-brand-olive mb-2">Welcome Back</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-10">Access your artisan profile</p>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize Access</span>}
            </button>
            
            <div className="text-center pt-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                New user? <Link to="/signup" className="text-brand-gold">Create Account</Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
