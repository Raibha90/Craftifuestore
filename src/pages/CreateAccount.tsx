import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Smartphone, MapPin, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CreateAccount() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [cooldownLeft, setCooldownLeft] = useState(30); // 30 seconds
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isVerifying && !isOtpExpired) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            setCooldownLeft(0); // Resend button active immediately
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isVerifying, isOtpExpired]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isVerifying && cooldownLeft > 0) {
      timerId = setInterval(() => {
        setCooldownLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isVerifying, cooldownLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sanitizedPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      if (data.mock) {
         // Show the mock OTP to the user so they can test easily without Twilio
         alert(`TESTING MODE: Your Mock OTP is ${data.mockOTP}`);
      }
      
      setIsVerifying(true);
      setTimeLeft(300);
      setCooldownLeft(30);
      setIsOtpExpired(false);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: signupData.phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      
      if (data.mock) {
         alert(`TESTING MODE: Your Mock OTP is ${data.mockOTP}`);
      }

      setTimeLeft(300);
      setCooldownLeft(30);
      setIsOtpExpired(false);
      setVerificationCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isOtpExpired) {
      setError('OTP expired. Please click Resend OTP to receive a new code.');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: signupData.phone, otp: verificationCode })
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: signupData.name });

      // Send Email Verification
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
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
            ) : !isVerifying ? (
              <motion.div key="signup-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-serif font-bold text-brand-olive mb-2">Create Account</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-10">Start your artisan journey</p>
                
                <form onSubmit={handleSignupRequest} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="text" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} placeholder="John Doe" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required type="tel" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} placeholder="+91 98765 43210" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required type="email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} placeholder="name@example.com" className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Password</label>
                      <input required type="password" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Confirm</label>
                      <input required type="password" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Shipping Address</label>
                    <textarea required value={signupData.address} onChange={(e) => setSignupData({...signupData, address: e.target.value})} placeholder="Your complete address..." rows={2} className="w-full px-8 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-brand-gold text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-brand-gold/20 hover:shadow-brand-gold/30 transition-all flex items-center justify-center space-x-3 disabled:opacity-50" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Verification Code</span>}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="inline-flex p-6 bg-brand-gold/10 rounded-[2rem] mb-8">
                  <Smartphone className="w-10 h-10 text-brand-gold" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4">OTP Verification</h2>
                <div className="text-sm text-gray-500 mb-6 max-w-[320px] mx-auto leading-relaxed">
                  Enter the 6-digit code sent to <span className="font-bold text-brand-olive">{signupData.phone}</span> via SMS.<br/><br/>
                  <span className="font-bold text-brand-olive text-lg">{formatTime(timeLeft)}</span> remaining
                </div>
                {isOtpExpired && (
                  <div className="mb-4 text-xs font-bold text-red-500">
                    OTP expired. Please click Resend OTP to receive a new code.
                  </div>
                )}
                <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                  <input required disabled={isOtpExpired || loading} type="text" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full max-w-[240px] mx-auto px-6 py-5 bg-gray-50 border-2 border-brand-gold/20 rounded-2xl text-3xl tracking-[0.6em] text-center focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all font-bold text-brand-olive disabled:opacity-50" />
                  
                  <div className="flex flex-col space-y-4">
                    <button disabled={loading || verificationCode.length !== 6 || isOtpExpired} type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-30">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
                    </button>

                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={cooldownLeft > 0 || loading}
                      className="w-full bg-gray-100 text-gray-500 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cooldownLeft > 0 ? `Resend OTP in ${cooldownLeft}s` : 'Resend OTP'}
                    </button>
                  </div>
                  
                  <button type="button" onClick={() => setIsVerifying(false)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-gold block mx-auto pt-2">Back to Details</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
