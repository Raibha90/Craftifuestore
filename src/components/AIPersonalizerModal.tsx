import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Wand2, Loader2, Heart, ShoppingBag } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AIConfig {
  promptContext: string;
}

export default function AIPersonalizerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState('');
  const [roomOutfit, setRoomOutfit] = useState('');
  
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const { dispatch: cartDispatch } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    // Only show once per session
    const hasSeenPersonalizer = sessionStorage.getItem('hasSeenPersonalizer');
    if (!hasSeenPersonalizer) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenPersonalizer', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchAIRecommendations = async () => {
    setStep('loading');
    try {
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const allProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Fetch AI config
      let systemInstruction = "You are an AI personal shopper. Recommend exactly 5 products from the list.";
      try {
        const aiConfigSnap = await getDocs(collection(db, 'aiConfig'));
        if (!aiConfigSnap.empty) {
          systemInstruction = aiConfigSnap.docs[0].data()?.promptContext || systemInstruction;
        }
      } catch (e) {
        console.warn('Failed to load AI config, using default', e);
      }

      // Prepare context for Gemini
      const productCatalog = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        tags: p.tags
      }));

      const userPreference = `
        Occasion: ${occasion}
        Style: ${style}
        Budget: ${budget}
        Color: ${color}
        Room/Outfit: ${roomOutfit}
      `;

      const promptContext = `
        Here is our catalog:
        ${JSON.stringify(productCatalog)}

        Here is the user's preference:
        ${userPreference}

        Analyze the products and select the top 5 most suitable products for this user.
        Return ONLY the list of recommended product IDs.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptContext,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const text = response.text || "[]";
      let recommendedIds: string[] = [];
      try {
        recommendedIds = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse AI response:", err);
      }

      const foundProducts = recommendedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined)
        .slice(0, 5);

      setRecommendedProducts(foundProducts);
      setStep('results');
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      setStep('form');
    }
  };

  const handleAddToCart = (product: Product) => {
    cartDispatch({ type: 'ADD_ITEM', payload: { product, quantity: 1 } });
    navigate('/cart');
    setIsOpen(false);
  };

  const toggleWishlist = async (productId: string) => {
    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-olive/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="w-full max-w-2xl bg-brand-cream rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="bg-brand-olive p-8 text-center relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-brand-cream/60 hover:text-brand-cream transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <Wand2 className="w-12 h-12 text-brand-gold mx-auto mb-4" />
              <h2 className="text-3xl font-serif font-bold text-brand-cream mb-2">AI Personal Shopper</h2>
              <p className="text-brand-cream/80 italic">Let us find the perfect handcrafted piece just for you.</p>
            </div>

            <div className="p-8">
              {step === 'form' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Occasion</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Wedding, Casual, Gift" 
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-olive/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Style</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Minimalist, Vintage, Bold"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-olive/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Budget Range</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Under $100, Premium"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-olive/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Color Preference</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Earth Tones, Gold, Vibrant"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-olive/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive mb-2">Room / Outfit Theme</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Rustic Living Room, Summer Dress"
                        value={roomOutfit}
                        onChange={(e) => setRoomOutfit(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-olive/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={fetchAIRecommendations}
                    className="w-full py-4 bg-brand-gold text-brand-olive font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Find My Match</span>
                  </button>
                </div>
              )}

              {step === 'loading' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
                  <p className="text-brand-olive font-serif text-xl italic text-center">
                    Analyzing your preferences...<br/>
                    <span className="text-sm font-sans not-italic text-gray-500">Curating the perfect handcrafted pieces</span>
                  </p>
                </div>
              )}

              {step === 'results' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-brand-olive text-center mb-6">Your Personalized Matches</h3>
                  
                  {recommendedProducts.length > 0 ? (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {recommendedProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-brand-olive/5">
                          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-grow">
                            <h4 className="font-bold text-brand-olive line-clamp-1">{product.name}</h4>
                            <p className="text-brand-gold font-bold">${product.price}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{product.category}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => product.id && toggleWishlist(product.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                wishlist.includes(product.id || '') ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${wishlist.includes(product.id || '') ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="p-2 bg-brand-gold text-brand-olive rounded-lg hover:bg-yellow-400 transition-colors"
                            >
                              <ShoppingBag className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No perfect matches found. Try adjusting your preferences.</p>
                      <button 
                        onClick={() => setStep('form')}
                        className="mt-4 text-brand-olive font-bold uppercase tracking-widest text-xs hover:text-brand-gold transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-brand-olive/10 flex justify-between items-center">
                    <button 
                      onClick={() => setStep('form')}
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-brand-olive transition-colors"
                    >
                      Start Over
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2 bg-brand-olive text-brand-cream text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-brand-olive/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
