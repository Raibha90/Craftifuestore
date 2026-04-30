import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { ListOrdered, Search, ExternalLink, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VendorOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderSnap = await getDocs(collection(db, 'orders'));
      const allOrders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Filter orders containing this vendor's items
      const vendorOrders = allOrders.filter(order => 
        order.items.some(item => item.vendorId === user?.uid)
      ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setOrders(vendorOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.shippingAddress.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Orders Management</h1>
        <p className="text-gray-400 mt-2">Track fulfillment and manage your artisan sales.</p>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by Order ID or City..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-brand-olive/5 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 outline-none shadow-sm"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm italic font-bold uppercase tracking-widest">Collecting history...</div>
        ) : filteredOrders.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer City</th>
                <th className="px-8 py-6">My Items</th>
                <th className="px-8 py-6">My Subtotal</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => {
                const vendorItems = order.items.filter(item => item.vendorId === user?.uid);
                const vendorSubtotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const itemCount = vendorItems.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-bold text-brand-olive uppercase tracking-tighter">#{order.id.slice(-8)}</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">{order.shippingAddress.city}</td>
                    <td className="px-8 py-6">
                      <div className="flex -space-x-2">
                        {vendorItems.slice(0, 3).map((item, i) => (
                          <img key={i} src={item.images[0]} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                        ))}
                        {vendorItems.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400">
                            +{vendorItems.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">{itemCount} items</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-brand-gold text-sm">₹{vendorSubtotal.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-brand-gold hover:text-brand-olive transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-24 text-center space-y-6">
            <ListOrdered className="w-12 h-12 text-brand-olive/5 mx-auto" />
            <p className="text-gray-400 italic font-bold uppercase tracking-widest text-[10px]">No orders found for your masterpieces.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-olive/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="font-serif text-3xl font-bold text-brand-olive uppercase tracking-tight">Order Details</h3>
                  <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mt-1">Reference: #{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-brand-olive" />
                </button>
              </div>

              <div className="space-y-10 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {/* Shipping info */}
                <div className="p-6 bg-brand-cream/30 rounded-[2rem] border border-brand-olive/5">
                  <h4 className="text-[10px] font-bold text-brand-olive uppercase tracking-widest mb-4">Delivery Address</h4>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                </div>

                {/* Items list */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-brand-olive uppercase tracking-widest">My Items in this Order</h4>
                  {selectedOrder.items.filter(item => item.vendorId === user?.uid).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-white border border-gray-100 rounded-2xl">
                      <img src={item.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-grow">
                        <h5 className="text-sm font-bold text-brand-olive">{item.name}</h5>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-gold font-mono tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Combined Total</p>
                  <p className="text-3xl font-serif font-bold text-brand-olive mt-1">₹{selectedOrder.items.filter(item => item.vendorId === user?.uid).reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</p>
                </div>
                <button className="flex items-center space-x-2 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">
                  <Package className="w-4 h-4" />
                  <span>Mark as Ready</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
