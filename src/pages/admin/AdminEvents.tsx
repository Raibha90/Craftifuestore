import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Image as ImageIcon, Sparkles, Loader2, Plus, Trash2, SwitchCamera, Check } from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../components/Toast';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AppEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  isActive: boolean;
  bannerUrl: string;
  offerText: string;
  aiMessage?: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { showToast } = useToast();

  const [newEvent, setNewEvent] = useState<Partial<AppEvent>>({
    name: '',
    date: '',
    description: '',
    isActive: false,
    offerText: 'Special 10% Discount just for you!',
    bannerUrl: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'events'));
      const snapshot = await getDocs(q);
      const fetched: AppEvent[] = [];
      snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() } as AppEvent));
      
      // Sort by date roughly
      fetched.sort((a, b) => a.date.localeCompare(b.date));
      setEvents(fetched);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAIBanner = async (event: AppEvent) => {
    setIsGenerating(event.id);
    try {
      // 1. Generate marketing copy
      const chat = ai.chats.create({ model: 'gemini-2.5-flash' });
      const copyPrompt = `Generate a single short compelling 1-sentence welcome message for a website popup celebrating the Indian festival/event: ${event.name}. This is for an artisan handicraft and jewellery store. Keep it warm, festive, and enticing. Don't use emojis.`;
      const aiMessageRes = await chat.sendMessage({ message: copyPrompt });
      const aiMessage = aiMessageRes.text?.replace(/["']/g, '') || `Welcome to our ${event.name} celebration!`;

      // 2. Generate banner image using gemini-3.1-flash-image-preview
      const imagePrompt = `A cinematic, ultra-wide luxury photography banner for ${event.name}. High-end jewellery and handicraft aesthetic, minimal background, soft ambient lighting, photorealistic. Festive Indian theme.`;
      
      const imageRes = await ai.models.generateImages({
        model: 'gemini-3.1-flash-image-preview',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9'
        }
      });

      const bannerUrl = `data:image/jpeg;base64,${imageRes.generatedImages[0].image.imageBytes}`;

      // Update in DB
      await updateDoc(doc(db, 'events', event.id), {
        aiMessage,
        bannerUrl
      });

      showToast(`AI Banner generated successfully for ${event.name}`, 'success');
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast('Failed to generate AI Banner', 'error');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventRef = collection(db, 'events');
      await addDoc(eventRef, newEvent);
      showToast('Event added successfully', 'success');
      setIsAdding(false);
      setNewEvent({ name: '', date: '', description: '', isActive: false, offerText: 'Special 10% Discount!', bannerUrl: '' });
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast('Failed to add event', 'error');
    }
  };

  const toggleEventActive = async (event: AppEvent) => {
    try {
      await updateDoc(doc(db, 'events', event.id), {
        isActive: !event.isActive
      });
      showToast(`${event.name} is now ${!event.isActive ? 'Active' : 'Inactive'}`, 'success');
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast('Status update failed', 'error');
    }
  };

  const deleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, 'events', id));
        showToast('Event deleted', 'success');
        fetchEvents();
      } catch (err) {
         showToast('Failed to delete event', 'error');
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif text-brand-olive font-bold mb-2">Event Marketing AI</h1>
          <p className="text-gray-500 uppercase tracking-widest font-bold text-xs">Pre-generate festival banners & popups</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-brand-olive text-brand-cream px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Cancel' : 'Add Event'}</span>
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
          onSubmit={handleAddEvent}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Event Name</label>
              <input type="text" required placeholder="e.g. Diwali Extravaganza" className="w-full px-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Date String</label>
              <input type="text" required placeholder="e.g. 24th October or YYYY-MM-DD" className="w-full px-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Description (Internal)</label>
              <input type="text" className="w-full px-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Offer Text</label>
              <input type="text" required className="w-full px-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newEvent.offerText} onChange={e => setNewEvent({...newEvent, offerText: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="submit" className="bg-brand-gold text-brand-olive px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors">
              Save Event
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No events added yet. Add Indian calendar events to start generating AI banners!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
              <div className="h-48 bg-gray-100 relative group">
                {event.bannerUrl ? (
                  <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Banner Generated</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={() => generateAIBanner(event)}
                    disabled={isGenerating === event.id}
                    className="flex items-center space-x-2 bg-brand-cream text-brand-olive px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold disabled:opacity-50 transition-colors"
                  >
                    {isGenerating === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isGenerating === event.id ? 'Generating...' : (event.bannerUrl ? 'Regenerate AI Banner' : 'Generate AI Banner')}</span>
                  </button>
                </div>
                {/* Status indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <button onClick={() => toggleEventActive(event)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${event.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-black/40 text-gray-300 border-white/10'}`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                    </button>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-brand-gold font-bold text-[10px] uppercase tracking-widest mb-1">{event.date}</p>
                <h3 className="text-xl font-bold font-serif text-brand-olive mb-2">{event.name}</h3>
                {event.aiMessage && (
                  <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{event.aiMessage}"
                  </p>
                )}
                <p className="text-xs text-gray-400 font-medium mb-4 mt-auto">Offer: {event.offerText}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
