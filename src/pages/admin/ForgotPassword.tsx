import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Loader2, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Password Recovery | Craftifue Admin";
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the email
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      // Regardless of the error (user-not-found, etc.), we show success message 
      // to prevent email enumeration attacks (Security Best Practice).
      console.log('Password reset requested'); 
    } finally {
      // Always show success message
      setMessage('If an admin account is registered with this email, a reset link with instructions has been sent to your inbox.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-olive flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500 font-bold text-xs uppercase tracking-widest">Logo</div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-olive mb-2">Password Recovery</h1>
          <p className="text-sm font-medium text-gray-500 px-4">Provide your admin email address to receive secure reset instructions.</p>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-brand-olive/10 border border-brand-olive/20 rounded-2xl flex items-start space-x-3"
            >
              <ShieldCheck className="w-5 h-5 text-brand-olive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-olive font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleReset} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-olive px-4">Registered Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@craftifue.store"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
              />
            </div>
          </div>

          <button
            disabled={loading || !!message}
            type="submit"
            className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Recovery Email</span>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/login')}
            className="text-[10px] font-bold text-gray-400 hover:text-brand-gold uppercase tracking-widest flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </button>

          <a href="mailto:support@craftifue.store" className="text-[10px] font-bold text-gray-400 hover:text-brand-gold uppercase tracking-widest flex items-center space-x-1 transition-colors">
            <HelpCircle className="w-3 h-3" />
            <span>Support</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
