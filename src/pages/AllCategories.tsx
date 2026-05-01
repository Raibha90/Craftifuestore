import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fallbackProducts } from '../lib/fallbackData';

export default function AllCategories() {
  const [categories, setCategories] = useState<{name: string, count: number, image: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        let products = querySnapshot.docs.map(doc => doc.data() as Product);
        
        if (products.length === 0) {
           products = fallbackProducts;
        }

        const catMap = new Map<string, {count: number, image: string}>();
        
        products.forEach(p => {
          if (!p.category) return;
          const current = catMap.get(p.category) || { count: 0, image: p.images?.[0] || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15' };
          catMap.set(p.category, {
            count: current.count + 1,
            image: current.image // Keep the first image found for the category
          });
        });

        const catArray = Array.from(catMap.entries()).map(([name, data]) => ({
          name,
          count: data.count,
          image: data.image
        }));
        
        setCategories(catArray);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        <p className="text-brand-olive font-serif italic text-lg">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">All Categories</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm uppercase tracking-widest font-bold">
          Explore our handcrafted collections
        </p>
        <div className="w-24 h-1 bg-brand-gold mx-auto mt-6" />
      </motion.div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group block relative overflow-hidden rounded-[2rem] aspect-[4/5] bg-gray-100"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A3F]/80 via-[#1A1A3F]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">{cat.name}</h3>
                    <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">{cat.count} Items</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-gold transition-colors">
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-500 italic">No categories found.</p>
        </div>
      )}
    </div>
  );
}
