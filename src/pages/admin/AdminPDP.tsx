import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { Settings, Save, Sparkles, Activity, MapPin, Search } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminPDP() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enablePincodeCheck: true,
    enableLiveActivity: true,
    enableAiSummary: true,
    enableBestForWhom: true,
    enableCompare: true,
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'pdp'), (docSnap) => {
      if (docSnap.exists()) {
         setSettings((s) => ({...s, ...docSnap.data()}));
      }
    });
    return () => unsub();
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'pdp'), settings, { merge: true });
      showToast('PDP Workflow settings saved.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Prodetails Workflow</h1>
        <p className="text-gray-400 mt-2">Manage the visibility of advanced conversion & trust features on the Product Details Page.</p>
      </header>

      <form onSubmit={saveSettings} className="space-y-8 max-w-3xl">
        <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-8">
           <h3 className="font-bold text-lg text-brand-olive flex items-center space-x-2">
              <Settings className="w-5 h-5 text-brand-gold" />
              <span>Feature Toggles</span>
           </h3>

           <div className="space-y-6">
              {[
                { key: 'enablePincodeCheck', label: 'Pincode-based Delivery ETA & Stock', description: 'Allows users to enter pincode to see estimated delivery dates.', icon: MapPin },
                { key: 'enableLiveActivity', label: 'Live Activity (Urgency)', description: 'Shows recent purchases or cart activity to build urgency ("5 people bought this in the last 24hrs").', icon: Activity },
                { key: 'enableAiSummary', label: 'AI Review Summary', description: 'Shows an AI-generated pros/cons summary based on product reviews.', icon: Sparkles },
                { key: 'enableBestForWhom', label: '"Best for Whom" Tag', description: 'Dynamically show who this product is best suited for.', icon: Search },
              ].map((feature) => (
                 <label key={feature.key} className="flex items-start space-x-4 cursor-pointer group p-4 border border-gray-100 rounded-2xl hover:border-brand-gold transition-all">
                    <div className="mt-1">
                      <div 
                         onClick={(e) => { e.preventDefault(); setSettings((s: any) => ({ ...s, [feature.key]: !s[feature.key] })) }}
                         className={`w-12 h-6 rounded-full transition-all relative ${settings[feature.key as keyof typeof settings] ? 'bg-brand-olive' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[feature.key as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-brand-olive group-hover:text-brand-gold transition-colors flex items-center space-x-2">
                          <feature.icon className="w-4 h-4 text-gray-400" />
                          <span>{feature.label}</span>
                       </p>
                       <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    </div>
                 </label>
              ))}
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full mt-4 bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2"
           >
             {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             <span>Save PDP Pipeline</span>
           </button>
        </div>
      </form>
    </div>
  );
}
