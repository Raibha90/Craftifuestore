import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { Search, Loader2, Target, Check, X, Building2, MapPin, Briefcase } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

interface DiscoveredVendor {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  source: string;
  onboardingFee: number;
}

export default function AdminVendorDiscovery() {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('home_decor');
  const [isAiScrapingOn, setIsAiScrapingOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<DiscoveredVendor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = ['jewelry', 'home_decor', 'pottery', 'textiles'];

  const handleSearch = async () => {
    if (!city || !category) return;
    setLoading(true);
    setProspects([]);
    setCurrentIndex(0);

    try {
      if (isAiScrapingOn) {
        // AI Prompts to simulate scraping / generating realistic leads
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Act as a B2B search engine. Find 5 realistic (can be fictional but realistic) dealer, manufacturer, or vendor businesses for "${category}" in "${city}". 
          Return a JSON array of objects. Do not use markdown.
          Format: [{"name": "Vendor Name", "description": "Brief about what they sell", "source": "Google Maps", "location": "${city}, India"}]`
        });
        
        let text = result.text || '[]';
        // Cleanup markdown if AI ignores instructions
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(text);
        
        const generatedProspects = data.map((v: any, index: number) => ({
          id: `prospect-${Date.now()}-${index}`,
          name: v.name,
          category: category,
          location: v.location,
          description: v.description,
          source: v.source || 'Web Search',
          onboardingFee: 2000
        }));

        setProspects(generatedProspects);
      } else {
         alert("AI Scraping is currently toggled OFF. Turn it on to search with AI.");
      }
    } catch (e: any) {
      console.error(e);
      alert('Failed to discover vendors. ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentProspect = prospects[currentIndex];

  const handleApprove = async () => {
    if (!currentProspect) return;
    
    // Create new vendor profile as pending for them to login and pay onboarding
    try {
      await addDoc(collection(db, 'vendors'), {
        name: currentProspect.name,
        category: currentProspect.category,
        city: city,
        country: 'India',
        status: 'pending',
        onboardingFee: currentProspect.onboardingFee,
        source: currentProspect.source,
        quality_score: 80,
        rating: 0,
        review_count: 0
      });
      moveToNext();
    } catch (e) {
      console.error(e);
      alert('Failed to approve vendor.');
    }
  };

  const handleReject = () => {
    // Rejects are forgotten/permanently deleted
    moveToNext();
  };

  const moveToNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="space-y-10 pb-32">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive tracking-tight">AI Vendor Discovery</h1>
        <p className="text-gray-500 mt-2">Discover, review, and onboard local craftsmen directly into the marketplace ecosystem.</p>
      </header>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-olive/5">
         <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-1/3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Location (City/State)</label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                placeholder="e.g. Kolkata" 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-gold/30"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-bold text-gray-600">AI Scraping</span>
              <button 
                onClick={() => setIsAiScrapingOn(!isAiScrapingOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAiScrapingOn ? 'bg-brand-olive' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiScrapingOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading || !city}
              className="px-8 py-4 bg-brand-gold text-brand-olive font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Discover Vendors"}
            </button>
         </div>
      </div>

      {/* Tinder Style UI View */}
      <div className="flex justify-center mt-12">
        {loading ? (
            <div className="flex flex-col items-center space-y-4 py-20">
               <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
               <p className="text-gray-400 animate-pulse font-serif italic text-lg">AI is searching the web for local artisans in {city}...</p>
            </div>
        ) : prospects.length > 0 && currentIndex < prospects.length ? (
            <AnimatePresence mode="popLayout">
                <motion.div 
                   key={currentProspect.id}
                   initial={{ opacity: 0, x: 50, rotate: 5 }}
                   animate={{ opacity: 1, x: 0, rotate: 0 }}
                   exit={{ opacity: 0, x: -50, rotate: -5 }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-brand-olive/5 relative"
                >
                   <div className="text-center space-y-6">
                      <div className="w-24 h-24 mx-auto bg-brand-olive/5 rounded-full flex items-center justify-center">
                         <Building2 className="w-10 h-10 text-brand-gold" />
                      </div>
                      
                      <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-olive">{currentProspect.name}</h2>
                        <div className="flex items-center justify-center text-gray-500 mt-2 space-x-2 text-sm">
                           <MapPin className="w-4 h-4" />
                           <span>{currentProspect.location}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-2xl text-left border border-brand-olive/10">
                        <div className="flex items-center space-x-2 text-brand-gold mb-2">
                           <Briefcase className="w-4 h-4" />
                           <span className="text-xs uppercase font-bold tracking-widest">Business Detail</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">{currentProspect.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-olive/10">
                         <div className="text-left">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Category</p>
                            <p className="font-medium text-brand-olive">{currentProspect.category}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Onboarding Fee</p>
                            <p className="font-bold text-brand-gold">Rs. {currentProspect.onboardingFee}</p>
                         </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-6 pt-6">
                          <button 
                            onClick={handleReject}
                            className="w-16 h-16 rounded-full bg-white border-2 border-red-100 flex items-center justify-center hover:bg-red-50 hover:border-red-500 transition-colors shadow-sm group"
                          >
                             <X className="w-6 h-6 text-red-400 group-hover:text-red-500" />
                          </button>

                          <button 
                            onClick={handleApprove}
                            className="w-20 h-20 rounded-full bg-brand-olive flex items-center justify-center shadow-xl hover:shadow-brand-olive/40 hover:scale-105 transition-all"
                          >
                             <Check className="w-8 h-8 text-brand-gold" />
                          </button>
                      </div>
                   </div>
                </motion.div>
            </AnimatePresence>
        ) : prospects.length > 0 && currentIndex >= prospects.length ? (
            <div className="text-center py-20">
               <Target className="w-16 h-16 text-gray-300 mx-auto mb-6" />
               <h3 className="text-2xl font-serif text-brand-olive">You've reviewed all prospects</h3>
               <p className="text-gray-500 mt-2">Adjust your search parameters to find more vendors.</p>
            </div>
        ) : (
            <div className="text-center py-20 opacity-50">
               <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
               <p className="text-gray-500">Enable AI Scraping and search to discover vendors</p>
            </div>
        )}
      </div>
    </div>
  );
}
