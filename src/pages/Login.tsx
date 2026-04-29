import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck, Eye, EyeOff, Home, Facebook, Check } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
         await auth.signOut();
         setError('Admin access from this portal is restricted. Please use the Admin Portal.');
         setLoading(false);
         return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
         await auth.signOut();
         setError('Admin access from this portal is restricted. Please use the Admin Portal.');
         setLoading(false);
         return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
         await auth.signOut();
         setError('Admin access from this portal is restricted. Please use the Admin Portal.');
         setLoading(false);
         return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Image Side */}
      <div className="hidden lg:flex w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop" 
          alt="Artisan Treasures" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Logo Area */}
        <Link to="/" className="absolute top-10 left-10 flex items-center space-x-3 bg-white px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 bg-brand-olive rounded-full flex items-center justify-center">
            <Home className="w-4 h-4 text-brand-cream" />
          </div>
          <span className="font-sans font-bold text-lg text-[#1A1A3F]">Artisan Treasures</span>
        </Link>

        {/* Text bottom left */}
        <div className="absolute bottom-16 left-16 text-white max-w-md">
          <h1 className="text-[2.5rem] leading-tight font-sans font-bold mb-4">Find your artisan treasure</h1>
          <p className="text-gray-300 text-base mb-8">Schedule visit in just a few clicks.<br/>visits in just a few clicks</p>
          <div className="flex space-x-2 items-center">
            <div className="h-1.5 w-8 bg-white rounded-full"></div>
            <div className="h-1.5 w-2 bg-white/40 rounded-full"></div>
            <div className="h-1.5 w-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col pt-8 lg:pt-0 justify-center relative bg-white">
        
        {/* Top right button */}
        <div className="absolute top-8 right-8 z-10 hidden sm:flex items-center">
            <Link to="/signup" className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-black/90 transition-all shadow-lg">
              Sign Up
            </Link>
        </div>

        <div className="w-full max-w-md mx-auto px-6 lg:px-0 relative z-0 mt-16 md:mt-0">
          <div className="mb-10 text-left">
            <h2 className="text-4xl text-[#18183B] font-bold mb-3 tracking-tight">Welcome Back to Artisan Treasures!</h2>
            <p className="text-gray-400 text-sm mb-2">Sign in your account</p>
            <p className="text-xs text-red-500 font-medium">Fields marked with <span className="font-bold">(*)</span> are mandatory.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-sm text-gray-600">Your Email <span className="text-red-500 text-xs ml-1">(*)</span></label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info.artisan@example.com"
                className="w-full px-5 py-3.5 bg-white border border-gray-400 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm text-gray-600">Password <span className="text-red-500 text-xs ml-1">(*)</span></label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-5 pr-12 py-3.5 bg-white border border-gray-400 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${rememberMe ? 'bg-black border-black text-white' : 'border-gray-400 bg-white group-hover:border-black'}`}>
                  {rememberMe && <Check className="w-3 h-3" />}
                </div>
                <span className="text-sm text-gray-600">Remember Me</span>
                <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              </label>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#1C1C1E] hover:bg-black text-white py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2 mt-8"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Login</span>}
            </button>
            <button
              disabled={loading}
              type="button"
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('demo123456');
              }}
              className="w-full bg-white text-[#1C1C1E] border border-gray-300 py-4 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 mt-3"
            >
              <span>Use Customer Demo</span>
            </button>
          </form>

          <div className="mt-10 relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-gray-200" />
            <span className="relative bg-white px-4 text-xs text-gray-400">Instant Login</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pb-12 lg:pb-0">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3 px-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[11px] font-semibold text-gray-600 block line-clamp-1">Continue with Google</span>
            </button>
            <button 
              type="button" 
              onClick={handleFacebookLogin}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3 px-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Facebook className="w-5 h-5 text-[#1877F2] shrink-0" />
              <span className="text-[11px] font-semibold text-gray-600 block line-clamp-1">Continue with Facebook</span>
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500 pb-12 lg:pb-0">
            Don't have any account? <Link to="/signup" className="text-blue-600 font-medium hover:underline">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

