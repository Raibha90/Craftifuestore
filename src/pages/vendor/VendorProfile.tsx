import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Phone, MapPin, Mail, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../../components/Toast';

export default function VendorProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorData, setVendorData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    category: '',
    whatsapp: '',
    instagram: '',
    description: ''
  });

  useEffect(() => {
    if (user) fetchVendorData();
  }, [user]);

  const fetchVendorData = async () => {
    try {
      const vendorDoc = await getDoc(doc(db, 'vendors', user!.uid));
      if (vendorDoc.exists()) {
        const data = vendorDoc.data();
        setVendorData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          category: data.category || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          description: data.description || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'vendors', user!.uid), vendorData);
      showToast('Vendor profile updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-brand-olive font-bold uppercase tracking-widest text-xs">Loading Artisan Identity...</div>;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Artisan Identity</h1>
        <p className="text-gray-400 mt-2">Personalize your storefront profile and contact details.</p>
      </header>

      <div className="max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3.5rem] border border-brand-olive/5 shadow-sm"
        >
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Business Name</label>
                <div className="relative">
                  <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vendorData.name}
                    onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-full text-sm focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Public Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-full text-sm focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={vendorData.phone}
                    onChange={(e) => setVendorData({...vendorData, phone: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-full text-sm focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">City / Region</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={vendorData.city}
                    onChange={(e) => setVendorData({...vendorData, city: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-full text-sm focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Shop Description</label>
                <textarea
                  rows={4}
                  value={vendorData.description}
                  onChange={(e) => setVendorData({...vendorData, description: e.target.value})}
                  className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[2rem] text-sm focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-medium leading-relaxed"
                  placeholder="Tell clients about your heritage and craftsmanship..."
                />
              </div>
            </div>

            <button
              disabled={saving}
              type="submit"
              className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-brand-olive/20 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
