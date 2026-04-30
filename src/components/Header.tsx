import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, ChevronDown, X, ArrowRight, Heart, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
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
  const [appearance, setAppearance] = useState<any>(null);

  // Real-time settings listeners
  useEffect(() => {
    const unsubGen = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setLogoUrl(doc.data().logoUrl || null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });
    
    const unsubApp = onSnapshot(doc(db, 'settings', 'appearance'), (doc) => {
      if (doc.exists()) {
        setAppearance(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/appearance');
    });

    return () => {
      unsubGen();
      unsubApp();
    };
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
        handleFirestoreError(error, OperationType.GET, 'products');
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
        { label: 'About Cratifue', path: '/about/cratifue' }
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
    { name: 'Lamps & Lighting', 
      path: '/category/lamps-lighting',
      items: [
        { label: 'All Lighting', path: '/category/lamps-lighting' },
        { label: 'Table Lamps', path: '/category/bamboo-table-lamp' },
        { label: 'Pendant Lights', path: '/category/bamboo-pendant-light' },
        { label: 'Night Lamps', path: '/category/bamboo-night-lamp' }
      ]
    },
    { name: 'Commissions', path: '/commissions' },
    { name: 'Contact US', path: '/contact' }
  ];

  return (
    <header id={id} className="fixed top-0 left-0 right-0 z-50">
      {/* Dynamic Announcement Bar */}
      {appearance?.topBarMessage && (
        <div className="bg-brand-gold text-brand-olive py-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-center shadow-sm">
          {appearance.topBarMessage}
        </div>
      )}

      {/* Special Header Alert */}
      {appearance?.headerAlert && (
         <div className="bg-brand-olive/95 text-brand-cream py-3 text-[10px] font-black uppercase tracking-[0.3em] text-center flex items-center justify-center space-x-3 px-4">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
            <span>{appearance.headerAlert}</span>
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
         </div>
      )}
      
      <div className="bg-brand-cream/90 backdrop-blur-md border-b border-brand-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl || "/regenerated_image_1777410191797.png"} 
              alt="Cratifue Logo" 
              className="h-16 w-auto"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Desktop Navigation removed. Moved to full screen menu */}

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
              <span className="absolute top-1 right-1 bg-brand-gold text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              {(user && !isAdmin) ? (
                <div className="relative group/account">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-brand-gold transition-all">
                    <div className="relative">
                      <User className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline-block">
                      {user.displayName?.split(' ')[0] || 'Hello'}
                    </span>
                    <ChevronDown className="w-3 h-3 transition-transform group-hover/account:rotate-180" />
                  </button>
                  
                  {/* Dropdown Tray */}
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-300 transform translate-y-2 group-hover/account:translate-y-0 z-50">
                    <div className="bg-white shadow-2xl rounded-[2rem] border border-brand-olive/5 p-2 w-56 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-50 mb-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Signed in as</p>
                        <p className="text-sm font-serif font-bold text-brand-olive truncate">{user.displayName || user.email}</p>
                      </div>
                      {[
                        { label: 'My Profile', path: '/dashboard?tab=profile', icon: User },
                        { label: 'My Account', path: '/dashboard?tab=orders', icon: ShoppingBag },
                        { label: 'Account Settings', path: '/dashboard?tab=profile', icon: Settings },
                      ].map((item) => (
                        <Link 
                          key={item.label}
                          to={item.path}
                          className="flex items-center space-x-3 px-6 py-3 text-xs font-medium text-gray-600 hover:bg-brand-olive hover:text-brand-cream rounded-xl transition-all"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <div className="h-[1px] bg-gray-50 my-1 mx-4" />
                      <button 
                        onClick={() => signOut(auth)}
                        className="w-full flex items-center space-x-3 px-6 py-3 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="p-2 text-gray-600 hover:bg-brand-olive/5 rounded-full transition-colors flex items-center space-x-1"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
            <button 
              className="p-2 text-brand-olive hover:bg-brand-olive/5 rounded-full transition-colors relative z-[60] w-10 h-10 flex flex-col items-center justify-center group" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex flex-col items-end space-y-1.5 w-6">
                <span className="w-full h-[2px] bg-current rounded-full transform transition-all duration-300"></span>
                <span className="w-4 h-[2px] bg-current rounded-full transform transition-all duration-300 group-hover:w-full"></span>
                <span className="w-full h-[2px] bg-current rounded-full transform transition-all duration-300"></span>
              </div>
            </button>
          </div>
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
      
      {/* Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-lg z-[80] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 md:p-10 border-b border-white/10">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img 
                  src={logoUrl || "/regenerated_image_1777410191797.png"} 
                  alt="Logo" 
                  className="h-10 md:h-12 brightness-0 invert" 
                  referrerPolicy="no-referrer"
                />
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto w-full flex items-center justify-center p-6 md:p-10">
              <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 items-start">
                {navItems.map((item, index) => (
                  <motion.div 
                    key={item.name} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="space-y-6"
                  >
                    {item.path ? (
                      <Link 
                        to={item.path} 
                        className="text-2xl md:text-3xl font-serif font-bold text-white transition-colors block group relative w-fit"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                        <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm md:text-base uppercase tracking-[0.3em] font-medium text-brand-gold border-b border-white/20 pb-4">{item.name}</p>
                        <div className="space-y-4">
                          {item.items?.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.path}
                              className="block text-xl md:text-2xl font-serif text-white/80 transition-colors group relative w-fit"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sub.label}
                              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
