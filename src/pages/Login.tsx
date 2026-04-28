import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowRight, Smartphone, Mail, Globe } from 'lucide-react';

export default function Login() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8 bg-brand-cream/50">
      <div className="max-w-md w-full space-y-12 bg-white p-12 rounded-[3.5rem] shadow-sm border border-brand-olive/5 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-olive/5 rounded-full -ml-12 -mb-12 blur-xl" />

        <div className="text-center relative">
          <Link to="/" className="inline-flex flex-col mb-8">
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-olive uppercase">Handcrafted</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold -mt-1">Home & Jewellery</span>
          </Link>
          <h2 className="text-3xl font-serif font-bold text-brand-olive mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">Join our artisan community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-4 bg-white border border-gray-100 py-4 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-300 bg-white px-4">Or use mobile</div>
          </div>

          {/* Mobile Login (Placeholder for WhatsApp OTP) */}
          <div className="space-y-4">
            <div className="relative">
              <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="+91 Mobile Number"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsOtpSent(true)}
              className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all"
            >
              Get OTP via WhatsApp
            </button>
          </div>
        </div>

        <div className="pt-8 text-center border-t border-gray-50">
          <p className="text-xs text-gray-400">
            By continuing, you agree to our <a href="#" className="text-brand-gold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-gold hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
