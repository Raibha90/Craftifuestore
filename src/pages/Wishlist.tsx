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

const fallbackProducts: Product[] = [
  // Jewellery
  { id: 'j1', name: 'Antique Brass Necklace', price: 2499, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop'], stock: 5, description: 'Handcrafted brass necklace', createdAt: '2026-01-01' },
  { id: 'j2', name: 'Silver Meenakari Jhumkas', price: 1850, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'], stock: 8, description: 'Traditional silver earrings', createdAt: '2026-01-02' },
  { id: 'j3', name: 'Rose Gold Floral Ring', price: 3200, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop'], stock: 3, description: 'Elegant rose gold ring', createdAt: '2026-01-03' },
  { id: 'j4', name: 'Kundan Work Bangles', price: 4500, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'Exquisite Kundan bangles', createdAt: '2026-01-04' },
  { id: 'j5', name: 'Pearl Beaded Choker', price: 2100, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop'], stock: 10, description: 'Classic pearl choker', createdAt: '2026-01-05' },
  
  // Bamboo Home Decor
  { id: 'b1', name: 'Bamboo Wall Clock', price: 1599, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=2070&auto=format&fit=crop'], stock: 6, description: 'Sustainable wall clock', createdAt: '2026-01-06' },
  { id: 'b2', name: 'Bamboo Weave Mirror', price: 2800, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1974&auto=format&fit=crop'], stock: 2, description: 'Artisan woven mirror', createdAt: '2026-01-07' },
  { id: 'b3', name: 'Bamboo Tray Set', price: 1250, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1610444319409-72c8423605e5?q=80&w=1915&auto=format&fit=crop'], stock: 15, description: 'Pair of bamboo trays', createdAt: '2026-01-08' },
  { id: 'b4', name: 'Bamboo Desk Organizer', price: 899, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1591122941067-e455952bb74e?q=80&w=1974&auto=format&fit=crop'], stock: 12, description: 'Eco-friendly organizer', createdAt: '2026-01-09' },
  { id: 'b5', name: 'Bamboo Partition Screen', price: 7500, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=2070&auto=format&fit=crop'], stock: 1, description: 'Handcrafted room divider', createdAt: '2026-01-10' },

  // Lamps & Lighting
  { id: 'l1', name: 'Modern Bamboo Lamp', price: 3499, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'], stock: 10, description: 'Eco-modern table lamp', createdAt: '2026-01-11' },
  { id: 'l2', name: 'Bamboo Pendant Light', price: 2600, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop'], stock: 7, description: 'Woven ceiling lamp', createdAt: '2026-01-12' },
  { id: 'l3', name: 'Decorative Lantern', price: 1800, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1974&auto=format&fit=crop'], stock: 9, description: 'Geometric bamboo lantern', createdAt: '2026-01-13' },
  { id: 'l4', name: 'Terracotta Night Lamp', price: 1450, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'Earthy bedside lamp', createdAt: '2026-01-14' },
  { id: 'l5', name: 'Crystal Bedside Lamp', price: 2200, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1974&auto=format&fit=crop'], stock: 11, description: 'Refined accent lighting', createdAt: '2026-01-15' },
];

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
