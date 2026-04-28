import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Heart, Loader2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

export default function MissionVision() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'about_mission'), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'cms/about_mission');
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
        <p className="text-brand-olive font-serif italic">Loading our mission...</p>
      </div>
    );
  }

  const data = content || {
    title: 'Our Mission & Vision',
    missionHeading: 'Our Mission',
    missionText: 'Our mission is to bridge the gap between rural artisans and the global market. We strive to provide a sustainable platform that empowers craftsmen, preserves traditional arts, and brings authentic, handcrafted luxury to conscious consumers worldwide.',
    missionImage: 'https://images.unsplash.com/photo-1541944743827-e04bb645d943?q=80&w=2000&auto=format&fit=crop',
    visionHeading: 'Our Vision',
    visionText: 'We envision a world where traditional craftsmanship is celebrated and valued as much as modern technology. Our goal is to become the leading destination for ethical, handmade goods, fostering a community that appreciates the beauty of slow-made, meaningful creations.',
    visionImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
      <div className="text-center space-y-4">
        <h5 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-gold">The Foundation</h5>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-olive">{data.title}</h1>
        <div className="w-24 h-1 bg-brand-gold mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="w-16 h-16 bg-brand-olive/5 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-olive">{data.missionHeading}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {data.missionText}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[3rem] overflow-hidden shadow-2xl h-[400px]"
        >
          <img 
            src={data.missionImage} 
            alt="Mission" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-2 md:order-1 rounded-[3rem] overflow-hidden shadow-2xl h-[400px]"
        >
          <img 
            src={data.visionImage} 
            alt="Vision" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 md:order-2 space-y-6"
        >
          <div className="w-16 h-16 bg-brand-olive/5 rounded-2xl flex items-center justify-center">
            <Eye className="w-8 h-8 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-olive">{data.visionHeading}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {data.visionText}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
