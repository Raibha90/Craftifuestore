import React, { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Loader2, Globe, Settings, Mail, Phone, Instagram, Facebook, Layout, Image as ImageIcon, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { processImage } from '../../lib/imageUtils';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    topBarMessage: 'FREE SHIPPING ON ORDERS OVER ₹4999',
    headerAlert: '',
    footerAbout: 'Cultivating a heritage of fine craftsmanship and timeless artistry since 2026.',
    copyrightText: '© 2026 Artisan Treasures. All rights reserved.',
    logoUrl: '',
    faviconUrl: '',
    whatsapp: '+91 98765 43210',
    email: 'hello@artisantreasures.in',
    instagram: 'artisantreasures',
    facebook: 'artisantreasures.india',
    storeAddress: '14, Govind Marg, Jaipur, Rajasthan',
    developerName: 'Mr. Rahul Dutta',
    developerTitle: 'CEO & Founder, Lead Architect of the Development',
    developerImage: '',
    showSocial: true,
    showNewsletter: true,
    showPaymentLogos: true,
    commissionRate: 15,
  });

  useEffect(() => {
    // Sync with general settings for logo
    const unsubGen = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({ ...prev, logoUrl: data.logoUrl || '', faviconUrl: data.faviconUrl || '' }));
      }
    });

    const unsubApp = onSnapshot(doc(db, 'settings', 'appearance'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    });

    return () => {
      unsubGen();
      unsubApp();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save Logo to general settings
      await setDoc(doc(db, 'settings', 'general'), {
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
      }, { merge: true });

      // Save Appearance settings
      const { logoUrl, faviconUrl, ...appearance } = settings;
      await setDoc(doc(db, 'settings', 'appearance'), {
        ...appearance,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error updating heritage settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="p-24 text-center text-gray-400">Loading configurations...</div>;
  }

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Store Governance</h1>
        <p className="text-gray-400 mt-2">Fine-tune the voice and presence of your artisan marketplace.</p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Header Controls */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-brand-gold mb-4">
            <Layout className="w-5 h-5" />
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-brand-olive">Header Controls</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Brand Logo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await processImage(file, { maxWidth: 500, maxHeight: 500 });
                      setSettings({ ...settings, logoUrl: compressed });
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="flex items-center justify-center w-full px-6 py-4 bg-gray-50 border border-brand-olive/10 hover:border-brand-gold border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                  <span className="text-xs font-bold text-brand-olive flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload Logo</span>
                </label>
                {settings.logoUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img src={settings.logoUrl} alt="Logo" className="w-auto h-12 object-contain" />
                  </div>
                )}
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Favicon</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await processImage(file, { isFavicon: true, format: 'image/png' });
                      setSettings({ ...settings, faviconUrl: compressed });
                    }
                  }}
                  className="hidden"
                  id="favicon-upload"
                />
                <label htmlFor="favicon-upload" className="flex items-center justify-center w-full px-6 py-4 bg-gray-50 border border-brand-olive/10 hover:border-brand-gold border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                  <span className="text-xs font-bold text-brand-olive flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload Favicon</span>
                </label>
                {settings.faviconUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Top Bar Announcement</label>
              <p className="text-[10px] text-gray-500 ml-1 mb-2">This message will appear at the very top of the website header.</p>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                value={settings.topBarMessage}
                onChange={e => setSettings({...settings, topBarMessage: e.target.value})}
                placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹2000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Special Header Alert (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Workshop closed for Diwali"
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all placeholder:italic"
                value={settings.headerAlert}
                onChange={e => setSettings({...settings, headerAlert: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Footer & About */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-brand-gold mb-4">
            <Globe className="w-5 h-5" />
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-brand-olive">Footer & Identity</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Footer "Our Story" Snippet</label>
              <textarea 
                rows={4}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all italic leading-relaxed"
                value={settings.footerAbout}
                onChange={e => setSettings({...settings, footerAbout: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Physical Store Base</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                value={settings.storeAddress}
                onChange={e => setSettings({...settings, storeAddress: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Footer Copyright Text</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                value={settings.copyrightText}
                onChange={e => setSettings({...settings, copyrightText: e.target.value})}
              />
            </div>
            
            <div className="pt-8 border-t border-brand-olive/5 space-y-8">
              <h4 className="text-sm font-bold text-brand-olive uppercase tracking-[0.2em]">Developer Credits</h4>
              
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Developer Image (Circle Profile)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await processImage(file, { maxWidth: 200, maxHeight: 200, format: 'image/jpeg' });
                      setSettings({ ...settings, developerImage: compressed });
                    }
                  }}
                  className="hidden"
                  id="dev-image-upload"
                />
                <label htmlFor="dev-image-upload" className="flex items-center justify-center w-full px-6 py-4 bg-gray-50 border border-brand-olive/10 hover:border-brand-gold border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                  <span className="text-xs font-bold text-brand-olive flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload Photo</span>
                </label>
                {settings.developerImage && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-center">
                    <img src={settings.developerImage} alt="Developer" className="w-16 h-16 rounded-full object-cover shadow-sm" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Developer Name</label>
                   <input 
                     type="text" 
                     className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                     value={settings.developerName}
                     onChange={e => setSettings({...settings, developerName: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Designation & Title</label>
                   <input 
                     type="text" 
                     className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                     value={settings.developerTitle}
                     onChange={e => setSettings({...settings, developerTitle: e.target.value})}
                   />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Communication Channels */}
        <section className="space-y-6 md:col-span-2">
          <div className="flex items-center space-x-3 text-brand-gold mb-4">
            <Settings className="w-5 h-5" />
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-brand-olive">Communication Channels</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center">
                   <Mail className="w-3 h-3 mr-2" /> Support Email
                </label>
                <input 
                  type="email" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={settings.email}
                  onChange={e => setSettings({...settings, email: e.target.value})}
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center">
                   <Phone className="w-3 h-3 mr-2" /> WhatsApp Concierge
                </label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center">
                   <Instagram className="w-3 h-3 mr-2" /> Instagram Handle
                </label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={settings.instagram}
                  onChange={e => setSettings({...settings, instagram: e.target.value})}
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center">
                   <Facebook className="w-3 h-3 mr-2" /> Facebook Page
                </label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={settings.facebook}
                  onChange={e => setSettings({...settings, facebook: e.target.value})}
                />
              </div>
              <div className="space-y-2 relative md:col-span-2 mt-4 pt-8 border-t border-gray-100">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1 flex items-center">
                   Vendor Commission Rate (%)
                </label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={settings.commissionRate}
                  onChange={e => setSettings({...settings, commissionRate: parseFloat(e.target.value) || 0})}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Display Controls */}
        <section className="space-y-6 md:col-span-2">
          <div className="flex items-center space-x-3 text-brand-gold mb-4">
            <Layout className="w-5 h-5" />
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-brand-olive">Display Visibility</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm">
            <div className="flex flex-wrap gap-12">
              {[
                { key: 'showSocial', label: 'Show Social Links' },
                { key: 'showNewsletter', label: 'Show Newsletter (Footer)' },
                { key: 'showPaymentLogos', label: 'Show Payment Providers' }
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-4 cursor-pointer group">
                  <div 
                    onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings[item.key as keyof typeof settings] ? 'bg-brand-olive' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[item.key as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-brand-olive transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="md:col-span-2 pt-8">
          <button 
            disabled={saving}
            type="submit" 
            className="w-full bg-brand-olive text-brand-cream py-6 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-4"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" />
                <span>Synchronize Heritage Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
