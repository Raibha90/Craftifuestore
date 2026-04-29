import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageBanner({ 
  title, 
  subtitle, 
  image = "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop" 
}: PageBannerProps) {
  return (
    <section className="relative h-[25vh] md:h-[35vh] flex items-center overflow-hidden w-full">
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 bg-brand-olive"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale-[0.2] opacity-50 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-olive via-brand-olive/50 to-transparent" />
      </motion.div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-cream mb-4 drop-shadow-md">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-brand-cream/90 max-w-2xl mx-auto italic font-serif">
              {subtitle}
            </p>
          )}
          <div className="w-12 h-1 bg-brand-gold mx-auto mt-6" />
        </motion.div>
      </div>
    </section>
  );
}
