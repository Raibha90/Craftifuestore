import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Loader2, Layout, FileText, Image as ImageIcon, Sparkles, Target, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type PageType = 'home' | 'about_story' | 'about_mission';

export default function AdminCMS() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'cms', currentPage), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        // Default initial structures if not exists
        const defaults: Record<PageType, any> = {
          home: {
            heroTitle: 'Artisan Crafted Elegance',
            heroSubtitle: 'Discover unique handcrafted treasures from across India.',
            philosophyHeading: 'Craftsmanship with Conscious Soul',
            philosophyContent: 'Craftifue is dedicated to bringing you the finest handmade treasures from across India...',
            philosophyImage: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'
          },
          about_story: {
            title: 'Where Tradition Meets Transformation',
            subtitle: '"Craftifue was born from a simple observation: the incredible talent of local artisans was often hidden from the world."',
            storyHeading: 'Our Story',
            storyParagraph1: 'Started in 2024, Craftifue began as a small initiative to support bamboo craftsmen in North East India...',
            storyParagraph2: 'Today, we have expanded to include brass artisans, meenakari jewelry makers...',
            mainImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1915&auto=format&fit=crop'
          },
          about_mission: {
            title: 'Our Mission & Vision',
            missionHeading: 'Our Mission',
            missionText: 'Our mission is to bridge the gap between rural artisans and the global market...',
            missionImage: 'https://images.unsplash.com/photo-1541944743827-e04bb645d943?q=80&w=2000&auto=format&fit=crop',
            visionHeading: 'Our Vision',
            visionText: 'We envision a world where traditional craftsmanship is celebrated and valued...',
            visionImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop'
          }
        };
        setContent(defaults[currentPage]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms', currentPage), {
        ...content,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving CMS:', err);
      alert('Error updating page content');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = () => {
    if (!content) return null;

    switch (currentPage) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Hero Heading</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif italic"
                  value={content.heroTitle}
                  onChange={e => setContent({...content, heroTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Hero Subtitle</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={content.heroSubtitle}
                  onChange={e => setContent({...content, heroSubtitle: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-brand-olive/5 p-10 rounded-[3rem] space-y-8 border border-brand-olive/5">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-olive mb-4">Philosophy Spotlight</h4>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Spotlight Heading</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-brand-gold outline-none transition-all font-serif"
                  value={content.philosophyHeading}
                  onChange={e => setContent({...content, philosophyHeading: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Spotlight Content</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-brand-gold outline-none transition-all leading-relaxed"
                  value={content.philosophyContent}
                  onChange={e => setContent({...content, philosophyContent: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Spotlight Image URL</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-brand-gold outline-none transition-all"
                  value={content.philosophyImage}
                  onChange={e => setContent({...content, philosophyImage: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 'about_story':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Page Main Heading</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif"
                  value={content.title}
                  onChange={e => setContent({...content, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Intro Subtitle/Quote</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all italic font-serif"
                  value={content.subtitle}
                  onChange={e => setContent({...content, subtitle: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] space-y-8 border border-brand-olive/5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Story Heading</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border-b-2 border-brand-gold/10 focus:border-brand-gold outline-none transition-all font-serif text-xl"
                      value={content.storyHeading}
                      onChange={e => setContent({...content, storyHeading: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Paragraph 1</label>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                      value={content.storyParagraph1}
                      onChange={e => setContent({...content, storyParagraph1: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Paragraph 2</label>
                    <textarea 
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                      value={content.storyParagraph2}
                      onChange={e => setContent({...content, storyParagraph2: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Story Image URL</label>
                   <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                      value={content.mainImage}
                      onChange={e => setContent({...content, mainImage: e.target.value})}
                   />
                   <div className="mt-4 aspect-[4/5] rounded-[2rem] overflow-hidden">
                      <img src={content.mainImage} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about_mission':
        return (
          <div className="space-y-12">
            <div className="space-y-2 max-w-xl">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Main Page Heading</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif text-3xl"
                value={content.title}
                onChange={e => setContent({...content, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 text-brand-gold">
                   <Target className="w-5 h-5" />
                   <h4 className="text-xs font-bold uppercase tracking-widest text-brand-olive">Mission Section</h4>
                </div>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border-b border-gray-100 focus:border-brand-gold outline-none transition-all font-serif text-xl"
                  placeholder="Mission Heading"
                  value={content.missionHeading}
                  onChange={e => setContent({...content, missionHeading: e.target.value})}
                />
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  placeholder="Mission Description"
                  value={content.missionText}
                  onChange={e => setContent({...content, missionText: e.target.value})}
                />
                <input 
                  type="text" 
                  className="w-full px-6 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-gold outline-none transition-all text-[10px]"
                  placeholder="Mission Image URL"
                  value={content.missionImage}
                  onChange={e => setContent({...content, missionImage: e.target.value})}
                />
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 text-brand-gold">
                   <Eye className="w-5 h-5" />
                   <h4 className="text-xs font-bold uppercase tracking-widest text-brand-olive">Vision Section</h4>
                </div>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border-b border-gray-100 focus:border-brand-gold outline-none transition-all font-serif text-xl"
                  placeholder="Vision Heading"
                  value={content.visionHeading}
                  onChange={e => setContent({...content, visionHeading: e.target.value})}
                />
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  placeholder="Vision Description"
                  value={content.visionText}
                  onChange={e => setContent({...content, visionText: e.target.value})}
                />
                <input 
                  type="text" 
                  className="w-full px-6 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-gold outline-none transition-all text-[10px]"
                  placeholder="Vision Image URL"
                  value={content.visionImage}
                  onChange={e => setContent({...content, visionImage: e.target.value})}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Content Management</h1>
          <p className="text-gray-400 mt-2">Curate the aesthetic and narrative of your heritage marketplace.</p>
        </div>

        <div className="relative group">
          <select 
            className="appearance-none bg-white border border-brand-olive/10 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-gold/30 shadow-sm pr-12 min-w-[240px] cursor-pointer"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value as PageType)}
          >
            <option value="home">Home Page</option>
            <option value="about_story">About: Our Story</option>
            <option value="about_mission">About: Mission & Vision</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
             <FileText className="w-4 h-4 text-brand-olive" />
          </div>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-12">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
             <p className="text-gray-400 font-serif italic">Loading page content structure...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {renderEditor()}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && (
          <div className="pt-8">
            <button 
              disabled={saving}
              type="submit" 
              className="w-full bg-brand-olive text-brand-cream py-6 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-4"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Marketplace Content</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
