import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { Package, Truck, CheckCircle, RefreshCcw, XCircle, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Order['status'], order?: Order) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      
      // If status is shipped, and we have a tracking number, notify via Twilio
      if (status === 'shipped' && order?.trackingNumber) {
         fetch('/api/send-sms', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             to: '+919999999999', // In production, use customer's phone
             message: `Artisan Treasures: Your order #${id.slice(-8).toUpperCase()} has been shipped! Tracking: ${order.trackingNumber}`
           })
         }).catch(e => console.error('SMS notification failed:', e));
      }
      
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTracking = async (id: string, trackingNumber: string, courierName: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { trackingNumber, courierName });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Order Fulfillment</h1>
          <p className="text-gray-400 mt-2">Manage customer orders and doorstep delivery.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100/50 p-2 rounded-2xl w-fit">
        {['all', 'pending', 'processed', 'shipped', 'delivered', 'cancelled', 'pending_payment'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-olive'
            }`}
          >
            {f === 'pending_payment' ? 'Unpaid' : f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div 
              key={order.id}
              layout
              className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm p-8 hover:shadow-xl hover:shadow-brand-olive/5 transition-all"
            >
              <div className="flex flex-col space-y-8">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-olive uppercase tracking-widest">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">
                       {order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
                  </div>

                  <div className="flex-grow lg:px-12">
                    <div className="flex flex-wrap gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-olive flex items-center space-x-2">
                          <span className="text-brand-gold">{item.quantity}x</span>
                          <span className="line-clamp-1">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-brand-olive">₹{order.totalAmount.toLocaleString()}</p>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                        order.status === 'pending_payment' ? 'bg-red-50 text-red-500' : 'bg-brand-gold/10 text-brand-gold'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-50" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Shipping Info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ship to</h4>
                    <div className="text-xs text-brand-olive space-y-1">
                      <p className="font-bold">{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city} - {order.shippingAddress.zipCode}</p>
                      <p className="text-gray-400">{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Tracking Management */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Logistics</h4>
                    <div className="space-y-3">
                       <input 
                         type="text" 
                         placeholder="Tracking ID (AfterShip)" 
                         defaultValue={order.trackingNumber}
                         onBlur={(e) => handleUpdateTracking(order.id, e.target.value, order.courierName || 'Standard')}
                         className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-brand-gold outline-none"
                       />
                       {order.trackingNumber && (
                         <div className="flex items-center space-x-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                            <Truck className="w-3 h-3" />
                            <span>Linked to AfterShip</span>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Update Status</h4>
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { status: 'pending', icon: RefreshCcw },
                        { status: 'processed', icon: Package },
                        { status: 'shipped', icon: Truck },
                        { status: 'delivered', icon: CheckCircle },
                        { status: 'cancelled', icon: XCircle }
                      ].map((s) => (
                        <button
                          key={s.status}
                          onClick={() => handleUpdateStatus(order.id, s.status as any, order)}
                          className={`p-3 rounded-xl transition-all ${order.status === s.status ? 'bg-brand-olive text-brand-cream shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-white hover:text-brand-gold'}`}
                        >
                          <s.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100 text-center">
            <Package className="w-16 h-16 text-gray-100 mx-auto mb-6" />
            <p className="text-gray-400 italic text-lg font-serif">No orders match your current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
