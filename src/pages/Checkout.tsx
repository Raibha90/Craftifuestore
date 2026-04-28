import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, MapPin, CreditCard, Truck, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const steps = ['Address', 'Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items,
        totalAmount: totalPrice,
        status: 'pending',
        shippingAddress: address,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setCurrentStep(4); // Success step
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 4) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 mb-8"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h1 className="text-4xl font-serif font-bold text-brand-olive mb-4">Mubarak! Order Placed</h1>
        <p className="text-gray-500 mb-12 max-w-md mx-auto">Your handcrafted treasures are being prepared. You will receive an update via WhatsApp shortly.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto bg-brand-olive text-brand-cream px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs"
          >
            Track Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto border border-brand-olive/20 text-brand-olive px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/5 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-brand-olive mb-4">Secure Checkout</h1>
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto flex items-center justify-between relative mt-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep >= idx ? 'bg-brand-olive text-brand-cream shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                {idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-widest mt-3 font-bold ${currentStep >= idx ? 'text-brand-olive' : 'text-gray-300'}`}>{step}</span>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 -z-1" />
          <div 
            className="absolute top-5 left-0 h-[2px] bg-brand-olive transition-all duration-500 -z-1" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Step Content */}
        <div className="lg:col-span-2 space-y-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-3 mb-8">
                  <MapPin className="w-6 h-6 text-brand-gold" />
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Street Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 42 Artisan Ln, Civil Lines"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">City</label>
                    <input 
                      type="text" 
                      placeholder="Jaipur"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Pincode</label>
                    <input 
                      type="text" 
                      placeholder="302001"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentStep(1)}
                  disabled={!address.street || !address.city || !address.zipCode}
                  className="w-full sm:w-auto bg-brand-olive text-brand-cream px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all disabled:opacity-50"
                >
                  Continue to Shipping
                </button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-3 mb-8">
                  <Truck className="w-6 h-6 text-brand-gold" />
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Shipping Method</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-white border-2 border-brand-olive rounded-3xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-olive">Standard Delivery</p>
                        <p className="text-xs text-gray-400">4-7 Business Days</p>
                      </div>
                    </div>
                    <span className="font-bold text-brand-gold uppercase tracking-widest text-xs">Free</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentStep(0)}
                    className="border border-brand-olive/20 text-brand-olive px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/5"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="flex-grow sm:flex-none bg-brand-olive text-brand-cream px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-3 mb-8">
                  <CreditCard className="w-6 h-6 text-brand-gold" />
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Payment Details (Razorpay)</h2>
                </div>
                <div className="p-8 bg-brand-olive/5 rounded-3xl border border-dashed border-brand-olive/20 text-center">
                  <p className="text-gray-500 mb-6 italic">Secure payment processing via Razorpay. You can pay using UPI, Cards, Netbanking or Wallets.</p>
                  <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-8 mx-auto opacity-50 mb-8" />
                </div>
                <div className="flex space-x-4">
                   <button 
                    onClick={() => setCurrentStep(1)}
                    className="border border-brand-olive/20 text-brand-olive px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/5"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="flex-grow sm:flex-none bg-brand-olive text-brand-cream px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg"
                  >
                    Final Review
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="flex items-center space-x-3 mb-8">
                  <CheckCircle className="w-6 h-6 text-brand-gold" />
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Review Order</h2>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-brand-olive/5 space-y-6">
                  <div className="flex justify-between items-start border-b border-gray-50 pb-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Shipping To</p>
                      <p className="text-sm font-medium">{address.street}, {address.city} - {address.zipCode}</p>
                    </div>
                    <button onClick={() => setCurrentStep(0)} className="text-brand-gold text-xs font-bold uppercase tracking-widest hover:underline">Edit</button>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-4">Your Items</p>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-bold text-brand-olive">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="border border-brand-olive/20 text-brand-olive px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/5"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-grow bg-brand-olive text-brand-cream px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-brand-olive/90 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Place Order - ₹{totalPrice.toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] border border-brand-olive/5 shadow-sm sticky top-24">
             <h2 className="font-serif text-xl font-bold text-brand-olive mb-6">Summary</h2>
             <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-50">
               {items.map(item => (
                 <div key={item.id} className="flex justify-between text-gray-500">
                   <span className="line-clamp-1 flex-1 mr-4">{item.name}</span>
                   <span>x{item.quantity}</span>
                 </div>
               ))}
             </div>
             <div className="flex justify-between items-center mb-1">
               <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Amount</span>
               <span className="text-xl font-bold text-brand-olive">₹{totalPrice.toLocaleString()}</span>
             </div>
             <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] mb-8">Free Home Delivery</p>
             
             <div className="p-4 bg-brand-olive/5 rounded-2xl flex items-center space-x-3">
               <Truck className="w-4 h-4 text-brand-gold" />
               <p className="text-[10px] text-gray-500 leading-tight">
                 Est. Delivery: <strong>{new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(Date.now() + 8*24*60*60*1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong>
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
