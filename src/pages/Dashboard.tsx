import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order } from '../types';
import { Package, MapPin, User, LogOut, ChevronRight, Clock } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'shipped': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-brand-gold/10 text-brand-gold';
    }
  };

  const makeMeAdmin = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-olive/5 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center text-3xl font-serif font-bold mx-auto border-4 border-brand-cream shadow-xl">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </div>
            </div>
            <h2 className="font-serif text-xl font-bold text-brand-olive">{profile?.displayName}</h2>
            <p className="text-gray-400 text-xs mt-1 mb-6">{user?.email}</p>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors py-3 px-6 rounded-full border border-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            {!profile?.role || profile.role !== 'admin' ? (
              <button 
                onClick={makeMeAdmin}
                className="w-full mt-4 flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-olive transition-colors py-3 px-6 rounded-full border border-brand-gold/20"
              >
                <span>Become Admin (Testing)</span>
              </button>
            ) : null}
          </div>

          <nav className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm overflow-hidden">
            {[
              { icon: Package, label: 'My Orders', active: true },
              { icon: MapPin, label: 'Addresses' },
              { icon: User, label: 'Profile Settings' },
            ].map((item, i) => (
              <button 
                key={i} 
                className={`w-full flex items-center justify-between p-6 text-sm font-medium transition-colors ${item.active ? 'bg-brand-olive/5 text-brand-olive border-l-4 border-brand-gold' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-4">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-30" />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-serif font-bold text-brand-olive">My Artisan Journey</h1>
              <p className="text-gray-400 mt-2">Track and manage your handcrafted treasures.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Order History</h3>
            
            {loading ? (
               <div className="py-24 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-brand-olive uppercase tracking-widest">Loading orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl border border-brand-olive/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-6 border-b border-gray-50 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-olive">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-olive">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-lg font-serif font-bold text-brand-olive">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 bg-gray-50/50 p-2 rounded-xl pr-4">
                          <img src={item.images[0]} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-xs font-medium text-gray-600 line-clamp-1">{item.name}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center bg-gray-50 w-10 h-10 rounded-xl text-[10px] font-bold text-gray-400">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white py-24 rounded-[3rem] border border-brand-olive/5 text-center px-8">
                <ShoppingBag className="w-12 h-12 text-brand-gold/20 mx-auto mb-6" />
                <h4 className="font-serif text-xl font-bold text-brand-olive mb-2">No orders found</h4>
                <p className="text-gray-400 text-sm mb-8">You haven't placed any orders yet. Start your journey with our beautiful collections.</p>
                <Link to="/category/all" className="inline-block bg-brand-gold text-brand-olive px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-sm">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
