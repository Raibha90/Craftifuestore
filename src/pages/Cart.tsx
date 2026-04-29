import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <PageBanner 
          title="Shopping Cart" 
          subtitle="Your selected handcrafted treasures." 
          image="https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-gold/10 text-brand-gold mb-8">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-12 max-w-md mx-auto">Looks like you haven't added any handcrafted treasures to your cart yet.</p>
          <Link 
            to="/category/all" 
            className="inline-flex items-center space-x-3 bg-brand-olive text-brand-cream px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/90 transition-all shadow-lg"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ShuffledSections />
      </div>
    );
  }

  return (
    <div>
      <PageBanner 
        title="Shopping Cart" 
        subtitle="Your selected handcrafted treasures." 
        image="https://images.unsplash.com/photo-1549469033-667793d508e7?q=80&w=2070&auto=format&fit=crop" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-6 bg-white rounded-3xl border border-brand-olive/5 shadow-sm"
            >
              <div className="w-24 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-serif text-xl font-bold text-brand-olive mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{item.category}</p>
                <p className="text-brand-gold font-medium">₹{item.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center border border-brand-olive/10 rounded-full px-3 py-1">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-olive hover:bg-gray-100 rounded-full transition-colors"
                >-</button>
                <span className="w-10 text-center font-bold text-sm tracking-tighter">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-olive hover:bg-gray-100 rounded-full transition-colors"
                >+</button>
              </div>

              <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                <p className="font-bold text-brand-olive mb-4">₹{(item.price * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50/50 rounded-full transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-brand-olive text-brand-cream p-10 rounded-[3rem] sticky top-24 shadow-2xl">
            <h2 className="font-serif text-2xl font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-6 text-sm">
              <div className="flex justify-between text-brand-cream/60">
                <span>Items ({totalItems})</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-cream/60">
                <span>Shipping</span>
                <span className="text-brand-gold">FREE</span>
              </div>
              <div className="flex justify-between text-brand-cream/60">
                <span>Discount</span>
                <span>-₹0</span>
              </div>
              
              <div className="pt-6 border-t border-brand-cream/10">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-brand-cream/40 uppercase tracking-widest mt-2">VAT Included where applicable</p>
              </div>
            </div>

            <Link 
              to="/checkout"
              className="mt-10 w-full inline-flex items-center justify-center space-x-3 bg-brand-gold text-brand-olive py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-cream transition-all shadow-lg"
            >
              <span>Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      </div>
      <ShuffledSections />
    </div>
  );
}
