import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Banner } from '../../types';
import { Plus, Trash2, LayoutPanelLeft, Link as LinkIcon, Eye, Save, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '/category/all',
    order: 1,
    active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'banners'));
      setBanners(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)).sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), {
          ...newBanner,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'banners'), {
          ...newBanner,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setNewBanner({ title: '', subtitle: '', imageUrl: '', link: '/category/all', order: banners.length + 1, active: true });
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert('Error saving highlight');
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt && !newBanner.title) {
      alert('Please provide a prompt or a title.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const prompt = aiPrompt || `A cinematic, ultra-wide luxury photography of ${newBanner.title} - ${newBanner.subtitle}. High-end jewellery brand aesthetic, minimal background, soft ambient lighting, photorealistic.`;
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: 'gemini-1.5-flash',
          contents: [{ text: prompt }] 
        })
      });
      if (!response.ok) throw new Error('AI request failed');
      const result = await response.json();

      let foundImage = false;
      if (result.candidates) {
        for (const candidate of result.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                const base64 = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64}`;
                
                // Update local state
                const updatedBanner = { ...newBanner, imageUrl };
                setNewBanner(updatedBanner);

                // Automatically save to DB if we are editing an existing banner
                if (editingId) {
                  await updateDoc(doc(db, 'banners', editingId), {
                    imageUrl,
                    updatedAt: serverTimestamp()
                  });
                  fetchBanners();
                }
                
                foundImage = true;
                break;
              }
            }
          }
          if (foundImage) break;
        }
      }

      if (!foundImage) {
        throw new Error('No image was generated. Please try again.');
      }
      
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'banners', id), { active: !currentStatus });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Remove this highlight?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Visual Highlights</h1>
          <p className="text-gray-400 mt-2">Manage homepage hero sections and promotional banners.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-3 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Add Highlight</span>
        </button>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm">Arranging canvas...</div>
        ) : banners.length > 0 ? (
          banners.map((banner, i) => (
            <motion.div 
              key={banner.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-[3rem] border ${banner.active ? 'border-brand-olive/5 shadow-sm' : 'border-gray-200 opacity-60 grayscale'} overflow-hidden group`}
            >
              <div className="flex flex-col lg:flex-row h-full">
                <div className="lg:w-1/3 h-64 lg:h-auto relative overflow-hidden">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-brand-olive/5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">Position: {banner.order}</span>
                  </div>
                </div>

                <div className="flex-grow p-10 flex flex-col justify-center space-y-6">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-brand-olive">{banner.title}</h3>
                    <p className="text-gray-500 italic mt-2">{banner.subtitle}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                    <LinkIcon className="w-4 h-4" />
                    <span>Target: {banner.link}</span>
                  </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => {
                            setEditingId(banner.id!);
                            setNewBanner({
                              title: banner.title,
                              subtitle: banner.subtitle,
                              imageUrl: banner.imageUrl,
                              link: banner.link,
                              order: banner.order,
                              active: banner.active || false
                            });
                            setIsModalOpen(true);
                          }}
                          className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-olive hover:text-brand-gold transition-colors"
                        >
                           <Save className="w-4 h-4" />
                           <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => toggleBannerActive(banner.id, banner.active || false)}
                          className={`flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${banner.active ? 'text-green-500' : 'text-gray-400'}`}
                        >
                           <Eye className="w-4 h-4" />
                           <span>{banner.active ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 text-center">
            <LayoutPanelLeft className="w-16 h-16 text-gray-100 mx-auto mb-6" />
            <p className="text-gray-400 italic text-lg font-serif">A clean canvas awaits your story.</p>
          </div>
        )}
      </div>

      {/* Banner Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-olive/20 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-2xl font-bold text-brand-olive">
                  {editingId ? 'Edit Visual Highlight' : 'New Visual Highlight'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setNewBanner({ title: '', subtitle: '', imageUrl: '', link: '/category/all', order: banners.length + 1, active: true });
                  }} 
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddBanner} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Main Heading</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif text-xl" 
                      value={newBanner.title} 
                      onChange={e => setNewBanner({...newBanner, title: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Sub-heading / Description</label>
                    <textarea 
                      rows={2}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all italic" 
                      value={newBanner.subtitle} 
                      onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Background Image URL</label>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAiModalOpen(true);
                          setAiPrompt(newBanner.title ? `A cinematic ultra-wide high-end professional banner photograph of ${newBanner.title}, ${newBanner.subtitle}, luxury brand aesthetic, minimal, blurred background, photorealistic.` : '');
                        }}
                        className="text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate AI</span>
                      </button>
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="url" 
                        required 
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                        value={newBanner.imageUrl} 
                        onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Target Path / Link</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                      value={newBanner.link} 
                      onChange={e => setNewBanner({...newBanner, link: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Display Order</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                      value={newBanner.order} 
                      onChange={e => setNewBanner({...newBanner, order: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Update & Publish' : 'Publish to Home'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Image Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-olive/40 backdrop-blur-md"
              onClick={() => setIsAiModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-olive">Generate Banner Visual</h3>
                <p className="text-gray-400 text-sm">Create a cinematic ultra-wide banner for your highlight. Describe the mood, colors, and items.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">AI Visual Prompt</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm leading-relaxed"
                  placeholder="e.g. A collection of artisan bridal jewelry on a cream velvet surface, warm sunlight..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs text-gray-400 hover:text-brand-olive transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerateAIImage}
                  disabled={isGeneratingAi}
                  className="flex-1 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
