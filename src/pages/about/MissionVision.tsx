import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Heart } from 'lucide-react';

export default function MissionVision() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
      <div className="text-center space-y-4">
        <h5 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-gold">The Foundation</h5>
        <h1 className="text-5xl font-serif font-bold text-brand-olive">Our Mission & Vision</h1>
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
          <h2 className="text-3xl font-serif font-bold text-brand-olive">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Our mission is to bridge the gap between rural artisans and the global market. We strive to provide a sustainable platform that empowers craftsmen, preserves traditional arts, and brings authentic, handcrafted luxury to conscious consumers worldwide.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[3rem] overflow-hidden shadow-2xl h-[400px]"
        >
          <img 
            src="https://images.unsplash.com/photo-1541944743827-e04bb645d943?q=80&w=2000&auto=format&fit=crop" 
            alt="Mission" 
            className="w-full h-full object-cover"
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
            src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop" 
            alt="Vision" 
            className="w-full h-full object-cover"
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
          <h2 className="text-3xl font-serif font-bold text-brand-olive">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            We envision a world where traditional craftsmanship is celebrated and valued as much as modern technology. Our goal is to become the leading destination for ethical, handmade goods, fostering a community that appreciates the beauty of slow-made, meaningful creations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
