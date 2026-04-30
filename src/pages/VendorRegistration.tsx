import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Mail, Lock, Store, Loader2, ShieldCheck, Phone, MapPin } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function VendorRegistration() {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 8 characters password with one Upper, Lower, Special Charatcers, and Number combinations
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await updateProfile(userCredential.user, {
        displayName: formData.businessName
      });

      // Save as vendor
      await setDoc(doc(db, 'vendors', userCredential.user.uid), {
        id: userCredential.user.uid,
        name: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        category: 'jewelry',
        tags: [],
        country: 'India',
        whatsapp: formData.phone,
        instagram: '',
        quality_score: 50,
        rating: 0,
        review_count: 0,
        source: 'registration',
        status: 'pending',
        role: 'vendor'
      });

      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            subject: 'Welcome to Cratifue as a Vendor!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="color: #4a5d23; font-size: 24px;">Welcome to Cratifue, ${formData.businessName}!</h2>
                </div>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for registering as a vendor. We are excited to collaborate with you to showcase your amazing artisan crafts to the world!</p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Our operations team will review your account soon. Meanwhile, you can log in and start customizing your profile.</p>
                <div style="text-align: center; margin: 40px 0;">
                  <a href="https://cratifue.store/login" style="background-color: #d4af37; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Login to Portal</a>
                </div>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.error('Failed to send vendor welcome email', emailErr);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register vendor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBanner 
        title="Become a Vendor" 
        subtitle="Join our network of skilled artisans." 
        image="https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop" 
      />
      <div className="min-h-screen bg-brand-cream/30 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-brand-olive/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <h2 className="text-3xl font-serif font-bold text-brand-olive mb-2">Vendor Registration</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">Join our artisan network and start selling</p>
          <p className="text-xs text-red-500 font-medium mb-6">Fields marked with <span className="font-bold">(*)</span> are mandatory.</p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Business Name <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                <div className="relative">
                  <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Your Shop Name"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Email Address <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Password <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Phone Number <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">City / Region <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="New Delhi"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3 mt-8"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Register as Vendor</span>}
            </button>
            
            <div className="text-center pt-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Already a vendor? <Link to="/login" className="text-brand-gold hover:text-brand-olive transition-colors">Sign in here</Link>
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
