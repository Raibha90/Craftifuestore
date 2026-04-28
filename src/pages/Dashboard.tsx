import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order } from '../types';
import { Package, MapPin, User, LogOut, ChevronRight, Clock, Heart, ShoppingBag, ShieldAlert, Mail, RefreshCw, CheckCircle2, Truck, ArrowRight } from 'lucide-react';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { profile, user, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show success toast if user just became verified in this session
    if (user?.emailVerified && sessionStorage.getItem('was_unverified') === 'true') {
      setShowSuccessToast(true);
      sessionStorage.removeItem('was_unverified');
      setTimeout(() => setShowSuccessToast(false), 8000);
    }
    
    if (user && !user.emailVerified) {
      sessionStorage.setItem('was_unverified', 'true');
    }
  }, [user?.emailVerified]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders' || tab === 'addresses' || tab === 'profile') {
      setActiveTab(tab as any);
    }
  }, [location]);

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

  const handleResendVerification = async () => {
    if (!user) return;
    setResending(true);
    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error('Error resending verification:', err);
    } finally {
      setResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'shipped': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-brand-gold/10 text-brand-gold';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Activation Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[100] bg-brand-olive text-brand-cream p-8 rounded-[2.5rem] shadow-2xl border border-brand-gold/20 max-w-sm"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl">Profile Activated!</h3>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Welcome to the inner circle! Your account is now fully verified and you can explore all artisan collections.
            </p>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="mt-6 w-full text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 py-3 rounded-full transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Banner */}
      {!user?.emailVerified && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-brand-gold/10 border border-brand-gold/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-brand-olive">Account Pending Activation</h3>
              <p className="text-xs text-gray-500 mt-1">Please verify your email address to unlock all artisan features.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-olive hover:text-brand-gold transition-colors py-3 px-6 rounded-full bg-white shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Check Status</span>
            </button>
            <button 
              onClick={handleResendVerification}
              disabled={resending || resendSuccess}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-white py-3 px-6 rounded-full bg-brand-gold shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:bg-green-500"
            >
              {resendSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Sent!</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{resending ? 'Sending...' : 'Resend Link'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-brand-olive/5 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center text-3xl font-serif font-bold mx-auto border-4 border-brand-cream shadow-xl uppercase">
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
          </div>

          <nav className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm overflow-hidden">
            {[
              { id: 'orders', icon: Package, label: 'My Orders' },
              { id: 'wishlist', icon: Heart, label: 'My Wishlist', action: () => navigate('/wishlist') },
              { id: 'addresses', icon: MapPin, label: 'Address Book' },
              { id: 'profile', icon: User, label: 'Profile Settings' },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => item.action ? item.action() : setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between p-6 text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-brand-olive/5 text-brand-olive border-l-4 border-brand-gold' : 'text-gray-500 hover:bg-gray-50'}`}
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
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div>
                <h1 className="text-4xl font-serif font-bold text-brand-olive">My Artisan Journey</h1>
                <p className="text-gray-400 mt-2">Track and manage your handcrafted treasures.</p>
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

                        {/* Tracking Link if available */}
                        {order.trackingNumber && (
                           <div className="mb-6 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                             <div className="flex items-center space-x-3 text-green-700">
                               <Truck className="w-4 h-4" />
                               <span className="text-[10px] uppercase font-bold tracking-widest">Tracking Number: {order.trackingNumber}</span>
                             </div>
                             <a 
                               href={`https://track.aftership.com/${order.trackingNumber}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:underline flex items-center space-x-1"
                             >
                               <span>Track with AfterShip</span>
                               <ChevronRight className="w-3 h-3" />
                             </a>
                           </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 bg-gray-50/50 p-2 rounded-xl pr-4">
                              <img src={item.images[0]} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="text-xs font-medium text-gray-600 line-clamp-1">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white py-24 rounded-[3rem] border border-brand-olive/5 text-center px-8">
                    <ShoppingBag className="w-12 h-12 text-brand-gold/20 mx-auto mb-6" />
                    <h4 className="font-serif text-xl font-bold text-brand-olive mb-2">No orders found</h4>
                    <p className="text-gray-400 text-sm mb-8">You haven't placed any orders yet.</p>
                    <Link to="/category/all" className="inline-block bg-brand-gold text-brand-olive px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-sm">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-brand-olive">Address Book</h1>
                <p className="text-gray-400 mt-2">Manage your shipping destinations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.addresses?.map((addr, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-brand-olive/5 shadow-sm relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-brand-gold/10 rounded-xl text-brand-gold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-olive">{addr.type}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Primary</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{addr.address}</p>
                    <div className="mt-8 flex space-x-4">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-olive transition-colors">Edit</button>
                      <button className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
                
                <button className="bg-dashed border-2 border-dashed border-brand-gold/20 rounded-3xl p-12 flex flex-col items-center justify-center text-brand-gold hover:bg-brand-gold/5 transition-colors group">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Add New Address</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-brand-olive">Profile Settings</h1>
                <p className="text-gray-400 mt-2">Update your personal information.</p>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-sm max-w-2xl">
                 <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Full Name</label>
                          <input type="text" defaultValue={profile?.displayName} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Phone</label>
                          <input type="tel" defaultValue={profile?.phone} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Email Address</label>
                       <input type="email" value={user?.email || ''} disabled className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm opacity-50 cursor-not-allowed" />
                    </div>
                    <button className="bg-brand-olive text-brand-cream px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all">
                       Save Changes
                    </button>
                 </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
