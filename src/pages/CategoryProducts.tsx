import { useParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
