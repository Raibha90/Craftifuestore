import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Award, Truck, ArrowRight } from 'lucide-react';

const philosophySection = (
  <section key="philosophy" className="bg-brand-olive py-16 text-brand-cream overflow-hidden rounded-[3rem] my-16 mx-4 sm:mx-6 lg:mx-8">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h5 className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-gold">Our Philosophy</h5>
          <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
            Craftsmanship with Conscious Soul
          </h2>
          <p className="text-brand-cream/70 leading-relaxed text-sm">
            Every product in our collection is a testament to the skill of our artisans and our commitment to sustainable luxury.
          </p>
          <ul className="space-y-3">
            {[
              { icon: Award, text: 'Artisan Authenticity Guaranteed' },
              { icon: Sparkles, text: 'Sustainable & Natural Materials' },
              { icon: Truck, text: 'Crafted with Love, Delivered with Care' },
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-xs">
                <item.icon className="w-4 h-4 text-brand-gold" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const newsletterSection = (
  <section key="newsletter" className="bg-brand-cream/50 py-16 my-16 mx-4 sm:mx-6 lg:mx-8 rounded-[3rem] border border-brand-olive/5 text-center">
    <div className="max-w-2xl mx-auto px-6">
      <Sparkles className="w-8 h-8 text-brand-gold mx-auto mb-4" />
      <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4">Join Our Artisan Community</h2>
      <p className="text-gray-500 mb-8 italic">Subscribe for early access to new collections and exclusive stories from our makers.</p>
      <form className="flex max-w-md mx-auto relative group">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="w-full px-6 py-4 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 shadow-sm"
        />
        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-brand-olive text-brand-cream px-6 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
          Subscribe
        </button>
      </form>
    </div>
  </section>
);

const exploreSection = (
  <section key="explore" className="bg-white py-16 my-16 mx-4 sm:mx-6 lg:mx-8 rounded-[3rem] border border-brand-olive/5 shadow-sm text-center">
    <div className="max-w-3xl mx-auto px-6">
      <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4">Discover Unique Treasures</h2>
      <p className="text-gray-500 mb-8 max-w-xl mx-auto">Explore our curated collection of handcrafted jewellery, sustainable bamboo decor, and artistic lighting.</p>
      <Link
        to="/category/all"
        className="inline-flex items-center space-x-3 bg-brand-gold text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-olive transition-colors group shadow-lg"
      >
        <span>Explore Collection</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </section>
);

const allSections = [philosophySection, newsletterSection, exploreSection];

export default function ShuffledSections() {
  const selectedSections = useMemo(() => {
    // Shuffle the array and pick first 2
    const shuffled = [...allSections].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {selectedSections}
    </div>
  );
}
