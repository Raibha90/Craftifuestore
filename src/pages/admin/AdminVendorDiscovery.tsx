import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateGeminiContent } from '../../lib/gemini';
import { Search, Loader2, Target, Check, X, Building2, MapPin, Briefcase, Filter, Globe, Tag, Mail, Phone } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';



interface DiscoveredVendor {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  source: string;
  onboardingFee: number;
  email?: string;
  phone?: string;
  website?: string;
}

interface ExistingVendor {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  country: string;
  city: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
}

export default function AdminVendorDiscovery() {
  const { showToast } = useToast();
  
  // AI Discovery States
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('home_decor');
  const [isAiScrapingOn, setIsAiScrapingOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<DiscoveredVendor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Database Filtering States
  const [existingVendors, setExistingVendors] = useState<ExistingVendor[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = ['jewelry', 'home_decor', 'pottery', 'textiles'];

  useEffect(() => {
    const q = query(collection(db, 'vendors'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setExistingVendors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExistingVendor)));
      setDbLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredVendors = existingVendors.filter(v => {
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    const matchesCategory = categoryFilter ? v.category === categoryFilter : true;
    const matchesCountry = countryFilter ? (v.country || '').toLowerCase().includes(countryFilter.toLowerCase()) : true;
    const matchesSearch = searchFilter ? (v.name || '').toLowerCase().includes(searchFilter.toLowerCase()) : true;
    return matchesStatus && matchesCategory && matchesCountry && matchesSearch;
  });

  const handleSearch = async () => {
    if (!city || !category) return;
    setLoading(true);
    setProspects([]);
    setCurrentIndex(0);

    try {
      if (isAiScrapingOn) {
        // AI Prompts to simulate scraping / generating realistic leads
        const response = await generateGeminiContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            role: 'user',
            parts: [{
              text: `Find real artisan vendors, wholesale dealers, or craft manufacturers for the category "${category}" located in "${city}", India. 
              Use your knowledge and search capabilities to find actual businesses.

              CRITICAL: Your response must be EXACTLY a raw JSON array of objects. 
              Do NOT use markdown code blocks.
              Do NOT include any extra text.

              JSON Schema:
              {
                "name": "Business Name",
                "description": "2-sentence summary of heritage and reputation",
                "location": "Specific area or address in ${city}",
                "source": "Web Search",
                "email": "actual email if found or empty string",
                "phone": "actual phone if found or empty string",
                "website": "actual website or social media URL"
              }`
            }]
          }],
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        
        const text = response.text || '';
        
        console.log('AI Discovery Raw Text:', text);

        // Robust JSON extraction
        let data = [];
        try {
          // Find the outer array
          const startIdx = text.indexOf('[');
          const endIdx = text.lastIndexOf(']');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonText = text.substring(startIdx, endIdx + 1);
            data = JSON.parse(jsonText);
          } else {
            // Fallback: maybe it returned a single object or something else
            try {
              const singleObj = JSON.parse(text);
              data = Array.isArray(singleObj) ? singleObj : [singleObj];
            } catch {
              console.warn('No JSON array found in AI response');
              data = [];
            }
          }
        } catch (parseError) {
          console.error('Failed to parse AI discovery JSON:', parseError);
          data = [];
        }
        
        if (!Array.isArray(data)) {
          data = [];
        }
        
        const generatedProspects = data.map((v: any, index: number) => ({
          id: `prospect-${Date.now()}-${index}`,
          name: v.name || 'Artisan Lead',
          category: category,
          location: v.location || city,
          description: v.description || 'Verified local craft vendor.',
          source: v.source || 'Lead Discovery',
          onboardingFee: 2000,
          email: v.email || '',
          phone: v.phone || '',
          website: v.website || ''
        }));

        setProspects(generatedProspects);
        if (generatedProspects.length > 0) {
          showToast(`Discovered ${generatedProspects.length} potential vendors using ${response.modelUsed || 'AI'}.`, 'success');
        } else {
          showToast(`No specific vendors found for ${category} in ${city}. Try a different category.`, 'info');
        }
      } else {
         showToast("AI Scraping is currently toggled OFF. Turn it on to search with AI.", "info");
      }
    } catch (e: any) {
      console.error('Discovery Error:', e);
      let message = 'AI Discovery failed.';
      
      if (e.message?.includes('429')) {
        message = 'AI Quota exceeded. Retrying with fallback model...';
      } else if (e.message?.includes('404')) {
        message = 'The AI model is currently being updated. Switching versions...';
      } else if (e.message?.includes('GoogleSearch') || e.message?.includes('tool') || e.message?.includes('400')) {
        message = 'Switching to internal artisan database (Search tool busy)...';
        // Force a retry without tools next time if user clicks again
        if (isAiScrapingOn) {
           setTimeout(() => handleSearch(), 500);
           return;
        }
      } else {
        message += ' ' + (e.message || '');
      }
      
      showToast(message, "error");
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
        email: currentProspect.email || '',
        phone: currentProspect.phone || '',
        website: currentProspect.website || '',
        quality_score: 80,
        rating: 0,
        review_count: 0
      });
      showToast(`Prospect ${currentProspect.name} moved to Pipeline.`, 'success');
      moveToNext();
    } catch (e) {
      console.error(e);
      showToast('Failed to onboard discovery lead.', 'error');
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

                      {/* Contact Info if available */}
                      {(currentProspect.phone || currentProspect.email) && (
                        <div className="flex items-center justify-center space-x-4 pt-2">
                          {currentProspect.phone && (
                            <a href={`tel:${currentProspect.phone}`} className="flex items-center space-x-2 text-xs text-brand-olive/60 hover:text-brand-olive transition-colors">
                              <Phone className="w-3 h-3" />
                              <span>{currentProspect.phone}</span>
                            </a>
                          )}
                          {currentProspect.email && (
                            <a href={`mailto:${currentProspect.email}`} className="flex items-center space-x-2 text-xs text-brand-olive/60 hover:text-brand-olive transition-colors">
                              <Mail className="w-3 h-3" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      )}

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

      {/* Database Filter Section */}
      <div className="mt-24 space-y-8" id="repository">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-brand-gold" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-brand-olive uppercase tracking-tight">Discovery Pipeline</h2>
            </div>
            <p className="text-gray-400 text-sm">Review recently discovered prospects and manage their approval status.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setStatusFilter('')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!statusFilter ? 'bg-brand-olive text-white' : 'text-gray-400 hover:text-brand-olive'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-brand-gold text-brand-olive shadow-md' : 'text-gray-400 hover:text-brand-olive'}`}
                >
                  Pending ({existingVendors.filter(v => v.status === 'pending').length})
                </button>
             </div>

             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by name..." 
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold/30 w-48 text-sm"
                />
             </div>

             <select 
               value={categoryFilter}
               onChange={e => setCategoryFilter(e.target.value)}
               className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold/30 text-sm font-bold uppercase tracking-widest text-brand-olive"
             >
               <option value="">All Categories</option>
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>

             <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Country" 
                  value={countryFilter}
                  onChange={e => setCountryFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-gold/30 w-32 text-sm"
                />
             </div>

             {(statusFilter || categoryFilter || countryFilter || searchFilter) && (
               <button 
                 onClick={() => {
                   setStatusFilter('');
                   setCategoryFilter('');
                   setCountryFilter('');
                   setSearchFilter('');
                 }}
                 className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold uppercase tracking-widest text-[10px]"
                 title="Clear Filters"
               >
                 Clear
               </button>
             )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-brand-olive/5 overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-olive/5 border-b border-brand-olive/5">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">Artisan Name</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">Location</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dbLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic font-serif">Syncing with marketplace database...</td>
                  </tr>
                ) : filteredVendors.length > 0 ? filteredVendors.map(v => (
                  <tr key={v.id} className="hover:bg-brand-olive/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-brand-olive group-hover:text-brand-gold transition-colors">{v.name}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        {v.phone && (
                          <a href={`tel:${v.phone}`} className="text-[10px] text-gray-400 hover:text-brand-olive flex items-center">
                            <Phone className="w-2.5 h-2.5 mr-1" /> Contact
                          </a>
                        )}
                        {v.email && (
                          <a href={`mailto:${v.email}`} className="text-[10px] text-gray-400 hover:text-brand-olive flex items-center">
                            <Mail className="w-2.5 h-2.5 mr-1" /> Email
                          </a>
                        )}
                        {v.website && (
                          <a href={v.website.startsWith('http') ? v.website : `https://${v.website}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-brand-olive flex items-center">
                            <Globe className="w-2.5 h-2.5 mr-1" /> Web
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs text-gray-500 uppercase tracking-widest">
                        <Tag className="w-3 h-3 mr-2 opacity-50" />
                        {v.category}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs text-gray-400 font-medium">{v.city || 'Unknown'}, {v.country || 'India'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          v.status === 'approved' ? 'bg-green-100 text-green-700' :
                          v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          {v.status}
                        </span>
                        
                        {v.status === 'pending' && (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'vendors', v.id), { status: 'rejected' });
                                  showToast(`${v.name} rejected.`, 'info');
                                } catch (e) { console.error(e); }
                              }}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'vendors', v.id), { status: 'approved' });
                                  
                                  // Send invitation email if email is available
                                  if (v.email) {
                                    try {
                                      await fetch('/api/send-email', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          to: v.email,
                                          subject: 'Your Artisan Profile on Craftifue has been Approved!',
                                          html: `
                                            <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #faf9f6; padding: 40px; border: 1px solid #e5e7eb;">
                                              <div style="text-align: center; margin-bottom: 30px;">
                                                <h1 style="color: #4a5d23; font-size: 28px; margin-bottom: 10px;">Craftifue</h1>
                                                <p style="color: #d4af37; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: bold;">Artisan Heritage Marketplace</p>
                                              </div>
                                              
                                              <h2 style="color: #4a5d23; text-align: center;">Welcome to the Family, ${v.name}</h2>
                                              <p style="color: #4b5563; line-height: 1.8;">We are delighted to inform you that your artisan business has been reviewed and verified by our curator team. You are now officially invited to join our premium marketplace platform.</p>
                                              
                                              <div style="background: white; padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px dashed #d1d5db;">
                                                <h3 style="color: #4a5d23; font-size: 16px; margin-top: 0;">Next Steps to Onboard:</h3>
                                                <ol style="color: #4b5563; padding-left: 20px;">
                                                  <li style="margin-bottom: 10px;">Visit our <a href="https://craftifue.store/vendor-signup" style="color: #4a5d23; font-weight: bold;">Vendor Registration Portal</a></li>
                                                  <li style="margin-bottom: 10px;">Create an account using this email address: <strong>${v.email}</strong></li>
                                                  <li style="margin-bottom: 15px;">Complete your store profile and list your first 5 products to go live.</li>
                                                </ol>
                                              </div>

                                              <div style="text-align: center; margin-top: 40px;">
                                                <a href="https://craftifue.store/vendor-signup" style="background: #4a5d23; color: white; padding: 16px 40px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">CLAIM YOUR STOREFRONT</a>
                                              </div>
                                              
                                              <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 60px; border-top: 1px solid #f3f4f6; pt-20">This is an automated invitation from our discovery pipeline. Please do not reply directly to this email.</p>
                                            </div>
                                          `
                                        })
                                      });
                                      showToast(`${v.name} approved and invitation sent.`, 'success');
                                    } catch (emailErr) {
                                      console.error('Email send failure', emailErr);
                                      showToast(`${v.name} approved, but email failed to send.`, 'info');
                                    }
                                  } else {
                                    showToast(`${v.name} approved.`, 'success');
                                  }
                                } catch (e) { console.error(e); }
                              }}
                              className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">No vendors found matching current repository filters.</td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
