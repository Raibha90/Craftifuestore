import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, MapPin, CreditCard, Truck, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../components/Toast';

const steps = ['Address', 'Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = totalPrice >= 10000 ? 0 : 250;
  const codFee = paymentMethod === 'cod' ? 30 : 0;
  const finalTotal = totalPrice + deliveryCharge + codFee;

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    country: 'India'
  });

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        const orderRef = await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items,
          totalAmount: finalTotal,
          status: 'pending',
          shippingAddress: address,
          paymentMethod: 'cod',
          paymentId: 'COD',
          razorpayOrderId: 'N/A',
          createdAt: serverTimestamp(),
        });

        // Send order confirmation email and SMS via our backend route
        const orderItemsHtml = items.map(item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4b5563;">${item.name} <span style="color: #9ca3af; font-size: 12px;">x ${item.quantity}</span></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #4b5563; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString()}</td>
          </tr>
        `).join('') + `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4b5563;">Delivery Charge</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #4b5563; font-weight: bold;">₹${deliveryCharge.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #4b5563;">COD Fee</td>
            <td style="padding: 12px; text-align: right; color: #4b5563; font-weight: bold;">₹${codFee.toLocaleString()}</td>
          </tr>
        `;

        await fetch('/api/orders/notify-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderRef.id,
            phone: (address as any).phone || user.phoneNumber,
            email: user.email,
            status: 'confirmed',
            itemsHtml: orderItemsHtml,
            totalAmount: finalTotal.toLocaleString(),
            order: {
              id: orderRef.id,
              createdAt: { seconds: Math.floor(Date.now() / 1000) },
              status: 'confirmed',
              address,
              items,
              totalAmount: finalTotal
            }
          })
        }).catch(err => console.error('Failed to send confirmation alerts', err));

        clearCart();
        setCurrentStep(4);
        showToast('Order confirmed via Cash on Delivery!', 'success');
        setLoading(false);
        return;
      }

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error('Razorpay Key ID is missing');
      }

      // 1. Create order in our backend to get Razorpay Order ID
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100), // Amount in paise, rounded to integer
          currency: 'INR',
          receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
        }),
      });

      const rzpOrder = await orderRes.json();
      if (!rzpOrder.id) {
        throw new Error(rzpOrder.error || 'Failed to create Razorpay order');
      }

      // 2. Initialize Razorpay Modal
      const options = {
        key: razorpayKeyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Artisan Treasures',
        description: 'Handcrafted Luxury Purchase',
        image: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=200&auto=format&fit=crop',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Create record in Firestore
              const orderRef = await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                items,
                totalAmount: finalTotal,
                status: 'pending', // Now it's paid
                shippingAddress: address,
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                createdAt: serverTimestamp(),
              });

              // 5. Send order confirmation email and SMS via our backend route
              const orderItemsHtml = items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4b5563;">${item.name} <span style="color: #9ca3af; font-size: 12px;">x ${item.quantity}</span></td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #4b5563; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('') + `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #4b5563;">Delivery Charge</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #4b5563; font-weight: bold;">₹${deliveryCharge.toLocaleString()}</td>
                </tr>
                ${codFee > 0 ? `
                <tr>
                  <td style="padding: 12px; color: #4b5563;">COD Fee</td>
                  <td style="padding: 12px; text-align: right; color: #4b5563; font-weight: bold;">₹${codFee.toLocaleString()}</td>
                </tr>
                ` : ''}
              `;

              await fetch('/api/orders/notify-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderRef.id,
                  phone: (address as any).phone || user.phoneNumber,
                  email: user.email,
                  status: 'confirmed',
                  itemsHtml: orderItemsHtml,
                  totalAmount: finalTotal.toLocaleString(),
                  order: {
                    id: orderRef.id,
                    createdAt: { seconds: Math.floor(Date.now() / 1000) },
                    status: 'confirmed',
                    address,
                    items,
                    totalAmount: finalTotal
                  }
                })
              }).catch(err => console.error('Failed to send confirmation alerts', err));

              clearCart();
              setCurrentStep(4);
              showToast('Payment verified. Order confirmed!', 'success');
            } else {
              showToast('Payment verification failed. Please contact support.', 'error');
            }
          } catch (err) {
            console.error('Verification error:', err);
            showToast('Something went wrong during verification.', 'error');
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#1A2F23', // brand-olive
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        showToast(`Payment failed: ${response.error.description}`, 'error');
      });
      rzp.open();

    } catch (err: any) {
      console.error('Error placing order:', err);
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
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
        <p className="text-gray-500 mb-12 max-w-md mx-auto">Your handcrafted treasures are being prepared. You will receive an update via SMS shortly.</p>
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
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-brand-gold" />
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Shipping Address</h2>
                </div>
                <p className="text-xs text-red-500 font-medium mb-8">Fields marked with <span className="font-bold">(*)</span> are mandatory.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Street Address <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
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
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">City <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
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
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">State <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <input 
                      type="text" 
                      placeholder="Rajasthan"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Pincode <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <input 
                      type="text" 
                      placeholder="302001"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.zipCode}
                   onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Phone Number <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                    <input 
                      type="tel" 
                      placeholder="9876543210"
                      required
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-gold/30 outline-none"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentStep(1)}
                  disabled={!address.street || !address.city || !address.zipCode || !address.phone || !address.state}
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
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  <div 
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-center justify-between p-6 border-2 rounded-3xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-brand-olive bg-white' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-brand-gold' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-3 h-3 bg-brand-gold rounded-full" />}
                      </div>
                      <div>
                        <p className="font-bold text-brand-olive">Prepaid Online</p>
                        <p className="text-xs text-gray-500">UPI, Credit/Debit Cards, Netbanking</p>
                      </div>
                    </div>
                    <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-4 opacity-50" />
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-6 border-2 rounded-3xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-brand-olive bg-white' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-brand-gold' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-3 h-3 bg-brand-gold rounded-full" />}
                      </div>
                      <div>
                        <p className="font-bold text-brand-olive">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay at the time of delivery (+ ₹30)</p>
                      </div>
                    </div>
                  </div>
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
                        <span>Place Order - ₹{finalTotal.toLocaleString()}</span>
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
               <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Subtotal</span>
               <span className="text-xl font-bold text-brand-olive">₹{totalPrice.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center mb-1">
               <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Delivery</span>
               <span className="text-xl font-bold text-brand-olive">
                 {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toLocaleString()}`}
               </span>
             </div>
             {paymentMethod === 'cod' && (
               <div className="flex justify-between items-center mb-1 mt-3">
                 <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">COD Fee</span>
                 <span className="text-xl font-bold text-brand-olive">₹{codFee.toLocaleString()}</span>
               </div>
             )}
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 mb-8">
               <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Amount</span>
               <span className="text-2xl font-bold text-brand-olive">₹{finalTotal.toLocaleString()}</span>
             </div>
             <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] mb-8">
               {deliveryCharge === 0 ? 'Free Home Delivery Applied' : 'Standard Delivery Applies'}
             </p>
             
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
