import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function EventModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    // Only show once per session to avoid annoying users
    const hasSeenModal = sessionStorage.getItem('hasSeenEventModal');
    if (hasSeenModal) return;

    const fetchActiveEvent = async () => {
      try {
        // Find active events that have a banner ready
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('isActive', '==', true));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
          // Prioritize events that have an AI generated banner
          const readyEvent = events.find(e => e.bannerUrl);
          
          if (readyEvent) {
            setEventData(readyEvent);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    // Slight delay so it doesn't pop up too fast
    const timer = setTimeout(() => {
      fetchActiveEvent();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenEventModal', 'true');
  };

  if (!eventData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-olive/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-3xl bg-brand-cream rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* AI Generated Banner Image */}
            <div className="md:w-1/2 relative h-64 md:h-full bg-gray-200 min-h-[300px]">
              {eventData.bannerUrl && (
                <img 
                  src={eventData.bannerUrl} 
                  alt={eventData.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-bold uppercase tracking-widest flex items-center space-x-2">
                <Gift className="w-4 h-4 text-brand-gold" />
                <span>Special Festive Event</span>
              </div>
            </div>

            {/* Event Content */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-2 block">{eventData.date}</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-olive mb-4">
                {eventData.name}
              </h2>
              
              {eventData.aiMessage && (
                <p className="text-gray-600 mb-8 italic">"{eventData.aiMessage}"</p>
              )}

              {eventData.description && (
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">{eventData.description}</p>
              )}

              <div className="bg-brand-olive/5 p-4 rounded-2xl mb-8 border border-brand-olive/10">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-olive mb-1">Exclusive Offer</p>
                <p className="text-lg font-medium text-brand-olive">{eventData.offerText || "Shop the festive collection now"}</p>
              </div>
              
              <Link
                to="/offers"
                onClick={handleClose}
                className="w-full py-4 text-center bg-brand-olive text-brand-cream font-bold uppercase tracking-widest text-xs rounded-full hover:bg-brand-gold transition-colors"
              >
                Shop Festive Offers
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
