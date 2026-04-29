import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Smartphone, MapPin, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function CreateAccount() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 8 characters password with one Upper, Lower, Special Charatcers, and Number combinations
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(signupData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    
    // Phone validation (simple regex for E.164 or basic generic, e.g. +91 9xxxxxxxxx)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; 
    let sanitizedPhone = signupData.phone.replace(/[\s-()]/g, '');
    
    if (!phoneRegex.test(sanitizedPhone)) {
      setError('Please enter a valid phone number with country code (e.g. +919876543210)');
      return;
    }
    
    setSignupData({ ...signupData, phone: sanitizedPhone });

    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: signupData.name });

      // Send Email Verification
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: signupData.name,
        email: signupData.email,
        phone: sanitizedPhone,
        role: 'customer',
        addresses: [{
          id: Date.now().toString(),
          type: 'Default',
          address: signupData.address,
          isDefault: true
        }],
        createdAt: new Date().toISOString()
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBanner 
        title="Join Our Artisan Community" 
        subtitle="Create your account to start your journey." 
        image="https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=2039&auto=format&fit=crop" 
      />
      <div className="min-h-screen bg-brand-cream/30 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full">
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
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 text-center flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-6"
              >
                <div className="inline-flex p-6 bg-green-50 rounded-[2rem] mb-8">
                  <Mail className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4">Activation Email Sent!</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-[320px] mx-auto leading-relaxed">
                  We've sent a verification link to <span className="font-bold text-brand-olive">{signupData.email}</span>. 
                  Please check your inbox (and spam folder) to activate your account.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all"
                  >
                    Go to Login
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Verification link expires in 1 hour.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-serif font-bold text-brand-olive mb-2">Create Account</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">Start your artisan journey</p>
                <p className="text-xs text-red-500 font-medium mb-6">Fields marked with <span className="font-bold">(*)</span> are mandatory.</p>
                
                <form onSubmit={handleSignupRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Full Name <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="text" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} placeholder="John Doe" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Phone Number <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                      <div className="relative">
                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="tel" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} placeholder="+91 98765 43210" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Email Address <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required type="email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} placeholder="name@example.com" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Password <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <input required type="password" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Shipping Address <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <textarea required value={signupData.address} onChange={(e) => setSignupData({...signupData, address: e.target.value})} placeholder="Your complete address..." rows={2} className="w-full px-8 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-brand-gold text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-brand-gold/20 hover:shadow-brand-gold/30 transition-all flex items-center justify-center space-x-3 disabled:opacity-50" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      </div>
      <ShuffledSections />
    </div>
  );
}
