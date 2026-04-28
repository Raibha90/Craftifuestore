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

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive">Order Fulfillment</h1>
          <p className="text-gray-400 mt-2">Manage customer orders and doorstep delivery.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="pl-12 pr-6 py-4 bg-white border border-brand-olive/5 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100/50 p-2 rounded-2xl w-fit">
        {['all', 'pending', 'processed', 'shipped', 'delivered', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400 hover:text-brand-olive'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-brand-olive/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6 p-8">
            {filteredOrders.map((order) => (
              <motion.div 
                key={order.id}
                layout
                className="bg-gray-50/30 rounded-3xl p-8 border border-transparent hover:border-brand-olive/10 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center space-y-6 lg:space-y-0">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-olive uppercase tracking-tighter">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-brand-gold font-medium">Customer ID: {order.userId.slice(-6)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
                       {order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
                  </div>

                  <div className="flex-grow lg:px-12">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2">
                          <span className="w-5 h-5 bg-brand-gold/10 text-brand-gold flex items-center justify-center rounded-md text-[10px] font-bold">{item.quantity}</span>
                          <span className="text-gray-600 line-clamp-1">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <div className="text-right">
                      <p className="text-lg font-serif font-bold text-brand-olive">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Via Razorpay</p>
                    </div>
                    
                    <div className="flex space-x-1">
                      {[
                        { status: 'pending', icon: RefreshCcw, color: 'hover:text-brand-gold' },
                        { status: 'processed', icon: Package, color: 'hover:text-blue-500' },
                        { status: 'shipped', icon: Truck, color: 'hover:text-purple-500' },
                        { status: 'delivered', icon: CheckCircle, color: 'hover:text-green-500' },
                        { status: 'cancelled', icon: XCircle, color: 'hover:text-red-500' }
                      ].map((s) => (
                        <button
                          key={s.status}
                          title={s.status}
                          onClick={() => handleUpdateStatus(order.id, s.status as any)}
                          className={`p-3 rounded-xl transition-all ${order.status === s.status ? 'bg-brand-olive text-brand-cream shadow-md' : 'bg-white text-gray-300 hover:shadow-sm ' + s.color}`}
                        >
                          <s.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center text-gray-400 italic">No orders match the current filter.</div>
        )}
      </div>
    </div>
  );
}
