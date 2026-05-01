import React, { useEffect, useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Heart, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

import { fallbackProducts } from '../lib/fallbackData';

export default function Wishlist() {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id || ''));

  if (loading || wishlistLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        <p className="text-brand-olive font-serif italic text-lg">Loading your treasures...</p>
      </div>
    );
  }

  return (
    <div>
      <PageBanner 
        title="Your Wishlist" 
        subtitle="A collection of pieces that caught your heart." 
        image="https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=2039&auto=format&fit=crop" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex p-4 bg-brand-gold/10 rounded-full mb-6">
            <Heart className="w-10 h-10 text-brand-gold fill-current" />
          </div>
          <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">Your Wishlist</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Save them for later or add them to your collection today.
          </p>
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-brand-cream/30 rounded-[3rem] border border-dashed border-brand-olive/10"
          >
            <ShoppingBag className="w-16 h-16 text-brand-gold/30 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-brand-olive mb-4">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-10 max-w-md mx-auto">
              You haven't saved any treasures yet. Explore our collections and find something handcrafted just for you.
            </p>
            <Link 
              to="/category/all" 
              className="inline-flex items-center space-x-3 bg-brand-gold text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-gold/20 hover:shadow-brand-gold/40 transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>

      <ShuffledSections />
    </div>
  );
}
