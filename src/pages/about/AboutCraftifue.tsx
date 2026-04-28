import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Globe, Loader2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AboutCraftifue() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'about_story'), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
        <p className="text-brand-olive font-serif italic">Gathering our story...</p>
      </div>
    );
  }

  const data = content || {
    title: 'Where Tradition Meets Transformation',
    subtitle: '"Craftifue was born from a simple observation: the incredible talent of local artisans was often hidden from the world."',
    storyHeading: 'Our Story',
    storyParagraph1: 'Started in 2024, Craftifue began as a small initiative to support bamboo craftsmen in North East India...',
    storyParagraph2: 'Today, we have expanded to include brass artisans, meenakari jewelry makers...',
    mainImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1915&auto=format&fit=crop'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
      {/* Intro */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-olive leading-tight">
          {data.title.split(' ').slice(0, -1).join(' ')} <span className="italic font-light">{data.title.split(' ').slice(-1)}</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed font-serif italic">
          {data.subtitle}
        </p>
        <div className="w-16 h-1 bg-brand-gold mx-auto" />
      </section>

      {/* Story */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-serif font-bold text-brand-olive">{data.storyHeading}</h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <p>{data.storyParagraph1}</p>
            <p>{data.storyParagraph2}</p>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="text-center">
              <h3 className="text-3xl font-serif font-bold text-brand-olive">50+</h3>
              <p className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Artisans</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-serif font-bold text-brand-olive">10+</h3>
              <p className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Regions</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-serif font-bold text-brand-olive">500+</h3>
              <p className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">Products</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-[4rem] overflow-hidden shadow-2xl h-[600px]">
            <img 
               src={data.mainImage} 
               alt="Artisan Story" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-10 -left-10 bg-brand-gold p-12 rounded-[3rem] text-brand-olive shadow-xl hidden md:block max-w-xs">
            <Sparkles className="w-8 h-8 mb-4" />
            <p className="font-serif font-bold text-xl leading-snug">Every piece is unique, just like the artisan who made it.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-olive text-brand-cream rounded-[4rem] p-16 md:p-24 overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <Users className="w-10 h-10 text-brand-gold" />
            <h3 className="text-2xl font-serif font-bold">Community First</h3>
            <p className="text-brand-cream/70 leading-relaxed">
              We work directly with artisan clusters, ensuring fair wages and healthy working environments. No middlemen, just pure connection.
            </p>
          </div>
          <div className="space-y-6">
            <Globe className="w-10 h-10 text-brand-gold" />
            <h3 className="text-2xl font-serif font-bold">Eco-Conscious</h3>
            <p className="text-brand-cream/70 leading-relaxed">
              From bamboo to terracotta, we prioritize natural materials that are biodegradable and sustainably sourced.
            </p>
          </div>
          <div className="space-y-6">
            <Sparkles className="w-10 h-10 text-brand-gold" />
            <h3 className="text-2xl font-serif font-bold">Timeless Design</h3>
            <p className="text-brand-cream/70 leading-relaxed">
              We blend traditional techniques with contemporary aesthetics, creating pieces that stay relevant for generations.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </section>
    </div>
  );
}
