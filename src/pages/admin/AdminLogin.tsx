import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function AdminLogin() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Craftifue-HandCrafts";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Craftifue Admin Portal - Secure entry point for administrative access.');
    }

    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'appearance'));
        if (snap.exists() && snap.data().logoUrl) {
          setLogoUrl(snap.data().logoUrl);
        }
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is actually an admin
      const adminDoc = await getDoc(doc(db, 'users', user.uid));
      const isAdminEmail = user.email === 'rd14190@gmail.com' || user.email === 'admin@craftique.store' || user.email === 'admin@craftifue.store';
      
      let isRoleAdmin = false;
      if (adminDoc.exists() && adminDoc.data().role === 'admin') {
        isRoleAdmin = true;
      }

      if (isRoleAdmin || isAdminEmail) {
        // Ensure their document exists and is set to admin
        if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
          await setDoc(doc(db, 'users', user.uid), { 
            role: 'admin', 
            email: user.email,
            uid: user.uid,
            displayName: user.displayName || 'Admin',
            addresses: []
          }, { merge: true });
        }
        showToast('Authorized. Welcome to Artisan Governance.', 'success');
        navigate('/admin');
      } else {
        await auth.signOut();
        showToast('Unauthorized access. This area is for administrators only.', 'error');
      }
    } catch (err: any) {
      showToast('Invalid credentials. Please try again.', 'error');
    } finally {
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
          <Link to="/" className="mb-6 flex justify-center hover:scale-105 transition-transform">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-auto h-24 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-500 font-bold text-xs uppercase tracking-widest">Admin</div>
            )}
          </Link>
          <h1 className="text-2xl font-serif font-bold text-brand-olive mb-2">Admin Portal</h1>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-olive px-4">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the admin Email"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PasswordA"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
              />
            </div>
            <div className="text-right">
              <button 
                type="button"
                onClick={() => navigate('/admin/forgot-password')}
                className="text-[10px] text-gray-500 hover:text-brand-gold uppercase tracking-widest font-bold"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize Entry</span>}
          </button>
          
          <button
            disabled={loading}
            type="button"
            onClick={() => {
              setEmail('admin@craftifue.store');
              setPassword('admin123456');
            }}
            className="w-full bg-white text-brand-olive border border-brand-olive/10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/5 transition-all flex items-center justify-center space-x-3 mt-4"
          >
            <span>Use Admin Demo</span>
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Craftifue Admin</p>
        </div>
      </motion.div>
    </div>
  );
}
