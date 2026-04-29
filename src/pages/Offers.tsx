import React from 'react';
import { motion } from 'motion/react';
import { Gift, Tag, ArrowRight, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';

export default function Offers() {
  const offers = [
    {
      id: 1,
      title: "New User Discount",
      description: "Get 20% off your first artisan treasure purchase.",
      code: "WELCOME20",
      validUntil: "2026-12-31",
      color: "bg-blue-50"
    },
    {
      id: 2,
      title: "Festive Season Sale",
      description: "Flat $50 off on orders above $500.",
      code: "FESTIVE50",
      validUntil: "2026-10-31",
      color: "bg-brand-cream/50"
    },
    {
      id: 3,
      title: "Free Shipping",
      description: "Enjoy free worldwide shipping on orders above $200.",
      code: "FREESHIP",
      validUntil: "2026-08-15",
      color: "bg-green-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageBanner 
        title="Special Offers" 
        subtitle="Exclusive deals on artisan treasures." 
        image="https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2115&auto=format&fit=crop" 
      />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Gift className="w-10 h-10 text-brand-gold" />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Current Offers & Discounts</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Use these exclusive promo codes at checkout to save on your favorite handcrafted items.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-8 relative overflow-hidden ${offer.color}`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {index % 2 === 0 ? <Percent className="w-6 h-6 text-brand-olive" /> : <Tag className="w-6 h-6 text-brand-gold" />}
                </div>
                
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-8 max-w-[250px]">{offer.description}</p>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between mb-4 shadow-sm">
                  <span className="font-mono font-bold text-lg text-brand-olive tracking-widest">{offer.code}</span>
                  <button className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-olive transition-colors">
                    Copy Code
                  </button>
                </div>
                
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-8">
                  Valid until {new Date(offer.validUntil).toLocaleDateString()}
                </div>
                
                <Link to="/category/all" className="inline-flex items-center space-x-2 text-sm font-bold text-brand-olive group">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
