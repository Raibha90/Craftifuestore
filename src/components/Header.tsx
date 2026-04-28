import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, ChevronDown, X, ArrowRight, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

export default function Header({ id }: { id: string }) {
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Real-time logo listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setLogoUrl(doc.data().logoUrl || null);
      }
    });
    return () => unsub();
  }, []);

  // Fetch all products once for instant local search (better UX for small-medium catalogs)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching products for search:", error);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      ).slice(0, 5); // Limit to 5 results for dropdown
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'About US', 
      items: [
        { label: 'Our Mission & Vision', path: '/about/mission-vision' },
        { label: 'About Craftifue', path: '/about/craftifue' }
      ]
    },
    { 
      name: 'Jewellery', 
      path: '/category/jewellery',
      items: [
        { label: 'All Jewellery', path: '/category/jewellery' },
        { label: 'Necklaces', path: '/category/necklace' },
        { label: 'Bangles', path: '/category/bangles' },
        { label: 'Rings', path: '/category/rings' }
      ]
    },
    { 
      name: 'Bamboo Home Decor', 
      path: '/category/bamboo-home-decor',
      items: [
        { label: 'All Bamboo Decor', path: '/category/bamboo-home-decor' },
        { label: 'Wall Decor', path: '/category/bamboo-wall-hanging' },
        { label: 'Tableware', path: '/category/bamboo-tray-set' },
        { label: 'Organizers', path: '/category/bamboo-pen-stand' }
      ]
    },
    { 
      name: 'Lamps & Lighting', 
      path: '/category/lamps-lighting',
      items: [
        { label: 'All Lighting', path: '/category/lamps-lighting' },
        { label: 'Table Lamps', path: '/category/bamboo-table-lamp' },
        { label: 'Pendant Lights', path: '/category/bamboo-pendant-light' },
        { label: 'Night Lamps', path: '/category/bamboo-night-lamp' }
      ]
    }
  ];

  return (
    <header id={id} className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-olive/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl || "/regenerated_image_1777410191797.png"} 
              alt="Craftifue Logo" 
              className="h-16 w-auto"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 items-center">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.path ? (
                  <Link 
                    to={item.path} 
                    className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-brand-olive transition-all py-4"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button className="flex items-center space-x-1 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-brand-olive transition-all py-4">
                    <span>{item.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.items && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-0 w-64 bg-white border border-brand-olive/5 shadow-2xl rounded-2xl overflow-hidden py-4 z-[60]"
                    >
                      {item.items.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          className="block px-8 py-3 text-[11px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-gold hover:bg-gray-50 transition-all border-l-2 border-transparent hover:border-brand-gold"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* User Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-brand-gold text-brand-cream' : 'text-gray-600 hover:bg-brand-olive/5'}`}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:bg-brand-olive/5 rounded-full transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-brand-gold text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-600 hover:bg-brand-olive/5 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-brand-gold text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="flex items-center space-x-2">
              <Link 
                to={user ? (isAdmin ? "/admin" : "/dashboard") : "/login"} 
                className="p-2 text-gray-600 hover:bg-brand-olive/5 rounded-full transition-colors flex items-center"
              >
                <div className="relative">
                  <User className="w-5 h-5" />
                  {user && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white" />
                  )}
                </div>
              </Link>
            </div>
            <button className="lg:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Thick Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-brand-olive/10 overflow-hidden shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
              <div className="max-w-3xl mx-auto relative group">
                <input
                  autoFocus
                  type="text"
                  placeholder="What can we help you find today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-brand-gold/10 rounded-[2.5rem] pl-16 pr-16 py-6 text-xl md:text-2xl font-serif text-brand-olive placeholder:text-gray-300 focus:outline-none focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5 transition-all shadow-sm"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-gold" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Real-time Results Area */}
              <AnimatePresence>
                {searchQuery.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 max-w-4xl mx-auto"
                  >
                    <div className="flex justify-between items-center mb-8 px-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Search Results</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{searchResults.length} items found</p>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center space-x-6 p-4 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-brand-gold/10 rounded-[2rem] border border-transparent hover:border-brand-gold/10 transition-all group"
                          >
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow">
                              <h4 className="font-serif text-lg font-bold text-brand-olive group-hover:text-brand-gold transition-colors">{product.name}</h4>
                              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-sm font-bold text-brand-olive">₹{product.price}</span>
                                <ArrowRight className="w-3 h-3 text-brand-gold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-lg font-serif italic text-gray-500">No treasures found for "{searchQuery}"</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mt-2">Try different keywords or browse our collections</p>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="mt-10 text-center">
                        <Link 
                          to="/category/all" 
                          className="inline-flex items-center space-x-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-olive hover:text-brand-gold transition-colors border-b-2 border-brand-gold/20 pb-2"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <span>Explore all handcrafted products</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-olive/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-brand-cream z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-brand-olive/5">
                <img 
                  src={logoUrl || "/regenerated_image_1777410191797.png"} 
                  alt="Logo" 
                  className="h-10" 
                  referrerPolicy="no-referrer"
                />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-brand-olive/5">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {navItems.map((item) => (
                  <div key={item.name} className="space-y-4">
                    {item.path ? (
                      <Link 
                        to={item.path} 
                        className="block text-sm font-bold uppercase tracking-widest text-brand-olive"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase font-bold text-brand-gold tracking-[0.3em]">{item.name}</p>
                        <div className="pl-4 border-l border-brand-olive/10 space-y-4">
                          {item.items?.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.path}
                              className="block text-sm font-medium text-gray-600 hover:text-brand-olive transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
