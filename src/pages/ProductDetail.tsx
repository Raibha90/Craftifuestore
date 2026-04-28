import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, ProductVariant } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          navigate('/category/all');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);
  const isFavorited = isInWishlist(product?.id || '');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorited) {
      await removeFromWishlist(product.id || '');
    } else {
      await addToWishlist(product.id || '');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-100"
          >
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex space-x-4">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-brand-gold bg-brand-gold/10' : 'border-transparent'}`}
              >
                <img src={img} alt={`View ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-brand-gold">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 text-gray-300" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-2">4.8 (24 Reviews)</span>
              </div>
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-brand-olive transition-colors flex items-center space-x-1">
                <ArrowLeft className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-olive mb-4">{product.name}</h1>
            <div className="flex items-baseline space-x-4">
              <p className="text-3xl font-medium text-brand-gold">₹{currentPrice.toLocaleString()}</p>
              {selectedVariant?.price && selectedVariant.price !== product.price && (
                <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-olive px-1">Select Option</h4>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-3 rounded-2xl border transition-all text-xs font-bold tracking-widest uppercase ${
                      selectedVariant?.id === variant.id 
                      ? 'border-brand-gold bg-brand-gold/5 text-brand-gold shadow-sm' 
                      : 'border-brand-olive/10 text-gray-400 hover:border-brand-gold/50'
                    }`}
                  >
                    {variant.name} {variant.price ? `(+₹${(variant.price - product.price).toLocaleString()})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-8 border-y border-brand-olive/10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Material</p>
              <p className="font-medium text-gray-900">{selectedVariant?.type === 'material' ? selectedVariant.name : (product.material || 'Handcrafted Mixed Material')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Availability</p>
              <p className={`font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {currentStock > 0 ? `In Stock (${currentStock} units)` : 'Out of Stock'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-brand-olive/20 rounded-full px-4 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 text-xl text-gray-400 hover:text-brand-olive transition-colors"
                >-</button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="w-10 h-10 text-xl text-gray-400 hover:text-brand-olive transition-colors"
                >+</button>
              </div>
              <button 
                onClick={() => {
                  const finalProduct = {
                    ...product,
                    price: currentPrice,
                    name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
                  };
                  addToCart(finalProduct, quantity);
                }}
                disabled={currentStock === 0}
                className="flex-grow bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-lg hover:bg-brand-olive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`p-5 rounded-full border transition-all ${isFavorited ? 'border-red-500 text-red-500 bg-red-50' : 'border-brand-olive/20 text-gray-400 hover:text-red-500 hover:border-red-500'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: 'Secure Payment' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RefreshCw, label: '10 Day Returns' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-50 text-center">
                  <item.icon className="w-6 h-6 text-brand-gold mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
