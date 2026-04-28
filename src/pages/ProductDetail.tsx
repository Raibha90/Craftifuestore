import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

const mockProducts: Product[] = [
  { 
    id: '1', 
    name: 'Antique Brass Necklace', 
    price: 2499, 
    category: 'Necklace', 
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop'
    ], 
    stock: 5, 
    description: 'This exquisite antique brass necklace is handcrafted by artisans in Jaipur. Featuring intricate designs and semi-precious stones, it is a perfect statement piece for any traditional outfit.', 
    material: 'Antique Brass, Semi-precious Stones',
    createdAt: '' 
  },
  // ... other products
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(() => mockProducts.find(p => p.id === id) || mockProducts[0], [id]);

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
            <div className="flex items-center space-x-2 text-brand-gold mb-2">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 text-gray-300" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-2">4.8 (24 Reviews)</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-olive mb-4">{product.name}</h1>
            <p className="text-2xl font-medium text-brand-gold">₹{product.price.toLocaleString()}</p>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-4 py-8 border-y border-brand-olive/10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Material</p>
              <p className="font-medium text-gray-900">{product.material || 'Handcrafted Mixed Material'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Availability</p>
              <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
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
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 text-xl text-gray-400 hover:text-brand-olive transition-colors"
                >+</button>
              </div>
              <button 
                onClick={() => addToCart(product, quantity)}
                className="flex-grow bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-lg hover:bg-brand-olive/90 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button className="p-5 rounded-full border border-brand-olive/20 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all">
                <Heart className="w-5 h-5" />
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
