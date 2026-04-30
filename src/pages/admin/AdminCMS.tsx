import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Loader2, Layout, FileText, Image as ImageIcon, Sparkles, Target, Eye, Upload, Plus, Trash2, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { processImage } from '../../lib/imageUtils';
import { useToast } from '../../components/Toast';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type PageType = 'home' | 'about_story' | 'about_mission' | 'contact' | 'banners' | 'commission_info' | 'terms' | 'privacy' | 'return_policy' | 'refund_policy' | 'login';

export default function AdminCMS() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '/category/all',
    order: 1,
    active: true
  });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [targetField, setTargetField] = useState<string | null>(null);
  const [imageReqs, setImageReqs] = useState({ width: '1200', height: '800', format: 'PNG' });

  const fetchBanners = async () => {
    try {
      const snap = await getDocs(collection(db, 'banners'));
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => a.order - b.order));
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt || !targetField) return;

    setGeneratingAI(true);
    try {
      const explicitInstruction = `Cinematic luxury photography. High-end aesthetic, minimal background.`;
      const prompt = `${aiPrompt}. ${explicitInstruction}`;

      // Try Imagen 3 first if possible, otherwise use the gemini-2.5 variant
      let base64Data = '';
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: { aspectRatio: "16:9" }
          },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      } catch (e: any) {
        // Fallback or catch specifically 429/404 if needed
        if (e.message.includes('429') || e.message.includes('limit: 0')) {
          throw new Error('Image generation quota exceeded or unavailable for this project tier/region. Please try uploading an image manually.');
        }
        throw e;
      }

      if (!base64Data) {
        throw new Error('No image was generated. Please try again or check your prompt.');
      }

      const rawImageUrl = `data:image/jpeg;base64,${base64Data}`;
      const res = await fetch(rawImageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'ai_generated.jpg', { type: 'image/jpeg' });
      const imageUrl = await processImage(file, { maxWidth: 1200, maxHeight: 800, format: 'image/jpeg', quality: 0.8 });

      if (currentPage === 'banners') {
        setNewBanner(prev => ({ ...prev, imageUrl }));
      } else {
        const updatedContent = { ...content, [targetField]: imageUrl };
        setContent(updatedContent);
        await setDoc(doc(db, 'cms', currentPage), {
          ...updatedContent,
          updatedAt: new Date().toISOString(),
        });
      }

      setIsAiModalOpen(false);
      setAiPrompt('');
      showToast('AI Image generated and applied successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error generating image: ' + err.message, 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'banners') {
      setLoading(true);
      fetchBanners().finally(() => setLoading(false));
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(doc(db, 'cms', currentPage), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        const defaults: Record<string, any> = {
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
            storyHeading: 'Ethical Sourcing & Heritage',
            storyParagraph1: 'Started in 2024, Craftifue began as a small initiative to support bamboo craftsmen in North East India...',
            storyParagraph2: 'Today, we have expanded to include brass artisans, meenakari jewelry makers...',
            mainImage: 'https://images.unsplash.com/photo-1596752002341-2a6c1e549da7?q=80&w=2070&auto=format&fit=crop'
          },
          about_mission: {
            title: 'Our Mission & Vision',
            missionHeading: 'Our Mission',
            missionText: 'Our mission is to bridge the gap between rural artisans and the global market...',
            missionImage: 'https://images.unsplash.com/photo-1541944743827-e04bb645d943?q=80&w=2000&auto=format&fit=crop',
            visionHeading: 'Our Vision',
            visionText: 'We envision a world where traditional craftsmanship is celebrated and valued...',
            visionImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop'
          },
          contact: {
            title: 'Artisan Concierge',
            subtitle: 'Partner with us for heritage-focused bulk orders and professional consultations.',
            bannerImage: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop',
            address: '1B3-2E, Sanhita Simoco Township Project, Satulia, Kashipur, Near Hatishala Six Lane, Newtown, Kolkata-700135',
            phone: '+91 93301 23456',
            email: 'bulk@craftifue.store'
          },
          commission_info: {
            title: 'Artisan Commission Structure',
            subtitle: 'Transparent and fair heritage-focused partnership models.',
            bannerImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop',
            content: 'Our commission model is designed to maximize artisan earnings while sustaining the marketplace...'
          },
          login: {
            image: 'https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop',
            heading: 'Find your artisan treasure',
            subheading: 'Schedule visit in just a few clicks.',
            title: 'Welcome Back!',
            subtitle: 'Sign in your account',
          }
        };
        setContent(defaults[currentPage] || { title: '', content: '' });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [currentPage]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPage === 'banners') return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms', currentPage), {
        ...content,
        updatedAt: new Date().toISOString(),
      });
      showToast('Page content updated successfully.', 'success');
    } catch (err) {
      console.error('Error saving CMS:', err);
      showToast('Error updating page content.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBannerId) {
        await updateDoc(doc(db, 'banners', editingBannerId), {
          ...newBanner,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'banners'), {
          ...newBanner,
          createdAt: serverTimestamp()
        });
      }
      setIsBannerModalOpen(false);
      setEditingBannerId(null);
      setNewBanner({ title: '', subtitle: '', imageUrl: '', link: '/category/all', order: banners.length + 1, active: true });
      fetchBanners();
      showToast(`Banner ${editingBannerId ? 'updated' : 'added'} successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error saving banner.', 'error');
    }
  };

  const toggleBannerActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'banners', id), { active: !currentStatus });
      fetchBanners();
    } catch (err) { console.error(err); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Remove this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      fetchBanners();
    } catch (err) { console.error(err); }
  };

  const renderEditor = () => {
    if (currentPage === 'banners') {
      return (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold text-brand-olive uppercase">Home Banners</h3>
            <button 
              type="button"
              onClick={() => setIsBannerModalOpen(true)}
              className="flex items-center space-x-2 bg-brand-olive text-brand-cream px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:shadow-brand-olive/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className={`bg-white p-6 rounded-[2rem] border ${banner.active ? 'border-brand-olive/5' : 'border-gray-200 grayscale opacity-60'} flex gap-6 items-center shadow-sm`}>
                <img src={banner.imageUrl} alt={banner.title} className="w-32 h-20 object-cover rounded-xl" />
                <div className="flex-grow">
                  <h4 className="font-bold text-brand-olive">{banner.title}</h4>
                  <p className="text-xs text-gray-400 italic line-clamp-1">{banner.subtitle}</p>
                </div>
                <div className="flex items-center space-x-4">
                   <button 
                    type="button"
                    onClick={() => {
                      setEditingBannerId(banner.id);
                      setNewBanner({...banner});
                      setIsBannerModalOpen(true);
                    }}
                    className="p-2 text-brand-olive hover:text-brand-gold"
                   >
                     <Save className="w-4 h-4" />
                   </button>
                   <button 
                    type="button"
                    onClick={() => toggleBannerActive(banner.id, banner.active)}
                    className={`p-2 ${banner.active ? 'text-green-500' : 'text-gray-400'}`}
                   >
                     <Eye className="w-4 h-4" />
                   </button>
                   <button 
                    type="button"
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 text-red-300 hover:text-red-500"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

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
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Spotlight Image Upload</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setTargetField('philosophyImage');
                      setAiPrompt(content.philosophyHeading ? `A professional high-end photography of ${content.philosophyHeading}, luxury aesthetic, cinematic lighting.` : '');
                      setIsAiModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate AI</span>
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    id="philosophy-image-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await processImage(file, { maxWidth: 1200, maxHeight: 800, format: 'image/jpeg' });
                        setContent({...content, philosophyImage: compressed});
                      }
                    }}
                    className="hidden" 
                  />
                  <label htmlFor="philosophy-image-upload" className="flex items-center justify-center w-full px-6 py-4 bg-gray-50 border border-brand-olive/10 hover:border-brand-gold border-dashed rounded-2xl cursor-pointer hover:bg-gray-100 transition-all flex-col">
                     <span className="text-xs font-bold text-brand-olive flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Upload Spotlight Image</span>
                  </label>
                  {content.philosophyImage && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <img src={content.philosophyImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
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
            <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <textarea 
                        rows={6}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="Story Paragraph 1"
                        value={content.storyParagraph1}
                        onChange={e => setContent({...content, storyParagraph1: e.target.value})}
                      />
                      <textarea 
                        rows={6}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                        placeholder="Story Paragraph 2"
                        value={content.storyParagraph2}
                        onChange={e => setContent({...content, storyParagraph2: e.target.value})}
                      />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Main Story Image</label>
                        <button type="button" onClick={() => { setTargetField('mainImage'); setIsAiModalOpen(true); }} className="text-[10px] text-brand-gold font-bold uppercase"><Sparkles className="w-3 h-3 inline mr-1" /> AI</button>
                      </div>
                      <input type="file" id="story-img" className="hidden" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const compressed = await processImage(file, { maxWidth: 1200, maxHeight: 1600, format: 'image/jpeg' });
                           setContent({...content, mainImage: compressed});
                         }
                      }} />
                      <label htmlFor="story-img" className="block w-full py-12 border-2 border-dashed border-gray-100 rounded-[2rem] text-center cursor-pointer hover:bg-gray-50">
                        <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <span className="text-xs text-gray-400 font-bold uppercase">Upload Heritage Visual</span>
                      </label>
                      {content.mainImage && <img src={content.mainImage} alt="Story" className="w-full h-48 object-cover rounded-2xl" />}
                   </div>
                </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Banner Title</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif"
                  value={content.title}
                  onChange={e => setContent({...content, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Banner Subtitle</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={content.subtitle}
                  onChange={e => setContent({...content, subtitle: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-brand-olive/5 p-10 rounded-[3rem] space-y-6 border border-brand-olive/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Phone" className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.phone} onChange={e => setContent({...content, phone: e.target.value})} />
                <input placeholder="Email" className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.email} onChange={e => setContent({...content, email: e.target.value})} />
              </div>
              <textarea placeholder="Address" rows={3} className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.address} onChange={e => setContent({...content, address: e.target.value})} />
              <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold font-mono tracking-widest">Banner Image</label>
                 <input type="file" id="contact-banner" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await processImage(file, { maxWidth: 1600, maxHeight: 600, format: 'image/jpeg' });
                      setContent({...content, bannerImage: compressed});
                    }
                 }} />
                 <label htmlFor="contact-banner" className="block w-full py-6 border-2 border-dashed border-brand-olive/10 rounded-2xl text-center cursor-pointer hover:bg-white/50 transition-all font-bold text-[10px] tracking-widest text-brand-olive uppercase">Set Page Banner</label>
                 {content.bannerImage && <img src={content.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded-xl mt-4" />}
              </div>
            </div>
          </div>
        );

      case 'login':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input placeholder="Form Title" className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.title} onChange={e => setContent({...content, title: e.target.value})} />
              <input placeholder="Form Subtitle" className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.subtitle} onChange={e => setContent({...content, subtitle: e.target.value})} />
            </div>
            <div className="bg-brand-olive/5 p-10 rounded-[3rem] space-y-6">
               <input placeholder="Image Heading" className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.heading} onChange={e => setContent({...content, heading: e.target.value})} />
               <textarea placeholder="Image Subheading" rows={2} className="w-full px-6 py-4 rounded-2xl focus:ring-2 ring-brand-gold outline-none" value={content.subheading} onChange={e => setContent({...content, subheading: e.target.value})} />
               {content.image && <img src={content.image} className="w-full h-48 object-cover rounded-2xl" />}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-10 rounded-[3rem] space-y-6 border border-brand-olive/5 shadow-sm">
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-serif text-xl"
              value={content.title}
              onChange={e => setContent({...content, title: e.target.value})}
            />
            <textarea 
              rows={20}
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all leading-relaxed"
              value={content.content}
              onChange={e => setContent({...content, content: e.target.value})}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">CMS Management</h1>
          <p className="text-gray-400 mt-2">Manage your marketplace content and visual highlights in one place.</p>
        </div>

        <div className="relative group">
          <select 
            className="appearance-none bg-white border border-brand-olive/10 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-gold/30 shadow-sm pr-12 min-w-[240px] cursor-pointer"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value as PageType)}
          >
            <option value="home">Home Page</option>
            <option value="banners">Home: Visual Highlights</option>
            <option value="commission_info">Commission Structure Page</option>
            <option value="about_story">About: Our Story</option>
            <option value="about_mission">About: Mission & Vision</option>
            <option value="contact">Contact Us Page</option>
            <option value="terms">Terms & Conditions</option>
            <option value="privacy">Privacy Policy</option>
            <option value="return_policy">Return Policy</option>
            <option value="refund_policy">Refund Policy</option>
            <option value="login">Login Page</option>
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
             <p className="text-gray-400 font-serif italic">Loading asset structures...</p>
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

        {(!loading && currentPage !== 'banners') && (
          <div className="pt-8">
            <button 
              disabled={saving}
              type="submit" 
              className="w-full bg-brand-olive text-brand-cream py-6 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-4"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Page Narrative</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Banner Modal */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-olive/20 backdrop-blur-sm" onClick={() => setIsBannerModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8">
              <h3 className="text-2xl font-serif font-bold text-brand-olive">{editingBannerId ? 'Edit Highlight' : 'New Highlight'}</h3>
              <form onSubmit={handleAddBanner} className="space-y-6">
                <input placeholder="Title" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                <input placeholder="Subtitle" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Target Link" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} />
                  <input type="number" placeholder="Order" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" value={newBanner.order} onChange={e => setNewBanner({...newBanner, order: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Background Image</label>
                      <button type="button" onClick={() => { setTargetField('banners'); setIsAiModalOpen(true); }} className="text-[10px] text-brand-gold font-bold uppercase"><Sparkles className="w-3 h-3 inline mr-1" /> AI Generate</button>
                   </div>
                   <input type="file" id="highlight-img" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await processImage(file, { maxWidth: 1920, maxHeight: 1080, format: 'image/jpeg' });
                        setNewBanner({...newBanner, imageUrl: compressed});
                      }
                   }} />
                   <label htmlFor="highlight-img" className="block w-full py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:bg-gray-100 font-bold text-[10px] uppercase tracking-widest text-gray-400">Upload Visual</label>
                   {newBanner.imageUrl && <img src={newBanner.imageUrl} className="w-full h-24 object-cover rounded-xl mt-2" />}
                </div>
                <button type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">Save Highlight</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Image Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-olive/40 backdrop-blur-md" onClick={() => setIsAiModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6"><Sparkles className="w-8 h-8 text-brand-gold" /></div>
                <h3 className="font-serif text-2xl font-bold text-brand-olive">Generate Brand Visual</h3>
              </div>
              <textarea rows={4} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm leading-relaxed" placeholder="Describe the aesthetic..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
              <div className="flex gap-4">
                <button onClick={() => setIsAiModalOpen(false)} className="flex-1 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs text-gray-400">Cancel</button>
                <button onClick={handleGenerateAIImage} disabled={generatingAI} className="flex-1 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg flex items-center justify-center space-x-2">
                  {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /><span>Generate</span></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
