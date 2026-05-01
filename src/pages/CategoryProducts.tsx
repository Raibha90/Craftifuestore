import { useParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { fallbackProducts } from '../lib/fallbackData';

export default function CategoryProducts() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'low-high' | 'high-low' | 'newest'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (category && category !== 'all') {
      const slugToCategory = (slug: string) => slug.toLowerCase().replace(/-/g, ' ');
      const targetSlug = slugToCategory(category);
      
      result = result.filter(p => {
        const prodCat = slugToCategory(p.category).replace(' & ', ' ');
        const targetClean = targetSlug.replace(' & ', ' ');
        return prodCat === targetClean || prodCat.includes(targetClean) || targetClean.includes(prodCat);
      });
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    switch (sortBy) {
      case 'low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // featured: keep original or use specific logic
        break;
    }

    return result;
  }, [category, products, sortBy, priceRange]);

  const categoryTitle = category ? category.split('-').map(w => w === 'us' ? 'US' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All Products';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        <p className="text-brand-olive font-serif italic text-lg">Loading our collection...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">{categoryTitle}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore our collection of {categoryTitle.toLowerCase()} handcrafted by expert artisans with premium materials.
        </p>
      </motion.div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-4 border-y border-brand-olive/10 relative z-30">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isFilterOpen ? 'text-brand-gold' : 'text-gray-600 hover:text-brand-olive'}`}
            >
              <Filter className="w-4 h-4" />
              <span>Price Range</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-4 w-64 bg-white shadow-2xl rounded-3xl border border-brand-olive/5 p-6 z-[60]"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-olive mb-4">Filter by Price</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'All Prices', range: [0, 10000] },
                      { label: 'Under ₹2,000', range: [0, 2000] },
                      { label: '₹2,000 - ₹5,000', range: [2000, 5000] },
                      { label: 'Over ₹5,000', range: [5000, 10000] }
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setPriceRange(option.range as [number, number]);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left text-xs py-2 px-4 rounded-xl transition-colors ${
                          JSON.stringify(priceRange) === JSON.stringify(option.range)
                            ? 'bg-brand-gold text-white font-bold'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-4 w-[1px] bg-brand-olive/20" />
          <p className="text-xs text-gray-400 uppercase tracking-widest">{filteredProducts.length} Products Found</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4 relative">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Sort by:</span>
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center space-x-2 text-sm font-bold text-brand-olive hover:text-brand-gold transition-colors"
            >
              <span className="capitalize">{sortBy.replace('-', ' ')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-48 bg-white shadow-2xl rounded-3xl border border-brand-olive/5 p-4 z-[60]"
                >
                  <div className="space-y-1">
                    {[
                      { id: 'featured', label: 'Featured' },
                      { id: 'low-high', label: 'Price: Low to High' },
                      { id: 'high-low', label: 'Price: High to Low' },
                      { id: 'newest', label: 'Newest Arrivals' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id as any);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left text-xs py-2 px-4 rounded-xl transition-colors ${
                          sortBy === option.id
                            ? 'bg-brand-olive text-brand-cream font-bold'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-500 italic">No products found in this category.</p>
        </div>
      )}
    </motion.div>
  );
}
