import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ShieldCheck, User, Store } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function Login() {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);

  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorError, setVendorError] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLoading(true);
    setCustomerError('');
    try {
      await signInWithEmailAndPassword(auth, customerEmail, customerPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      setCustomerError('Invalid email or password');
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorLoading(true);
    setVendorError('');
    try {
      await signInWithEmailAndPassword(auth, vendorEmail, vendorPassword);
      // Vendors go to admin or vendor dashboard
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setVendorError('Invalid email or password');
    } finally {
      setVendorLoading(false);
    }
  };

  return (
    <div>
      <PageBanner 
        title="Account Access" 
        subtitle="Select your journey path." 
        image="https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop" 
      />
      <div className="min-h-screen bg-brand-cream/30 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">

        {/* Vertical Layout: Customer Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-brand-olive/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-olive">Customer Login</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Access your artisan profile</p>
            </div>
          </div>
          
          {customerError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{customerError}</span>
            </div>
          )}

          <form onSubmit={handleCustomerLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <button
              disabled={customerLoading}
              type="submit"
              className="w-full bg-brand-olive text-brand-cream py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-2"
            >
              {customerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize Access</span>}
            </button>
            
            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                New user? <Link to="/signup" className="text-brand-gold hover:text-brand-olive transition-colors">Create Account</Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Vertical Layout: Vendor Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-brand-olive/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-olive/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-brand-olive/10 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6 text-brand-olive" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-olive">Vendor Login</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Manage your craft network</p>
            </div>
          </div>
          
          {vendorError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{vendorError}</span>
            </div>
          )}

          <form onSubmit={handleVendorLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                  placeholder="Vendor Email"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  value={vendorPassword}
                  onChange={(e) => setVendorPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                />
              </div>
            </div>

            <button
              disabled={vendorLoading}
              type="submit"
              className="w-full bg-brand-gold text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brand-gold/20 hover:bg-brand-olive transition-all flex items-center justify-center space-x-2"
            >
              {vendorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Vendor Sign In</span>}
            </button>
            
            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Become a vendor? <Link to="/vendor-signup" className="text-brand-olive hover:text-brand-gold transition-colors">Register as Vendor</Link>
              </p>
            </div>
          </form>
        </motion.div>

        </div>
      </div>
      <ShuffledSections />
    </div>
  );
}

