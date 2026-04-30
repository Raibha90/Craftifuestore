import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { ShoppingCart, Users, DollarSign, Package, TrendingUp, Clock, Settings, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../../components/Toast';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    products: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [shippingThreshold, setShippingThreshold] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLogoUrl(data.logoUrl || '');
        setShippingThreshold(data.shippingThreshold || 0);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orderSnap = await getDocs(collection(db, 'orders'));
        const productSnap = await getDocs(collection(db, 'products'));
        const userSnap = await getDocs(collection(db, 'users'));

        const orders = orderSnap.docs.map(doc => doc.data() as Order);
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalOrders: orderSnap.size,
          revenue,
          customers: userSnap.size,
          products: productSnap.size
        });

        const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        logoUrl: logoUrl,
        shippingThreshold: Number(shippingThreshold),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast('General settings updated successfully.', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const cards = [
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-brand-olive', bg: 'bg-brand-gold/10' },
    { label: 'Products', value: stats.products, icon: Package, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Success is in the craftsmanship and the metrics.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-brand-olive/5 shadow-sm space-y-4"
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
              <p className="text-3xl font-serif font-bold text-brand-olive mt-1">{card.value}</p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12% vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl font-bold text-brand-olive">Recent Orders</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline">View All</button>
          </div>
          
          <div className="bg-white rounded-3xl border border-brand-olive/5 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading data...</div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-8 py-4">Order ID</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-xs text-brand-olive uppercase tracking-tighter">#{order.id.slice(-6)}</td>
                      <td className="px-8 py-6 font-medium text-sm">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-400">
                        {order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-400 italic">No recent orders yet.</div>
            )}
          </div>
        </div>

        {/* Activity/Alerts & Settings */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-olive">System Alerts</h3>
            <div className="space-y-4">
              {[
                { label: 'Low Inventory', desc: 'Antique Brass Necklace is below 5 units.', color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Pending Payout', desc: '₹45,200 ready for transfer.', color: 'text-brand-olive', bg: 'bg-brand-gold/10' },
                { label: 'New Feedback', desc: 'A customer left a 5-star review.', color: 'text-green-600', bg: 'bg-green-50' }
              ].map((alert, i) => (
                <div key={i} className={`p-6 ${alert.bg} rounded-3xl border border-transparent hover:border-current/10 transition-all cursor-pointer`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${alert.color} mb-1`}>{alert.label}</p>
                  <p className="text-sm font-medium text-gray-600 leading-snug">{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-olive flex items-center space-x-3">
              <Settings className="w-6 h-6" />
              <span>Store Identity</span>
            </h3>
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-olive/5 shadow-sm">
               <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Store Logo Upload</label>
                     <div className="relative">
                        <input 
                           type="file" 
                           accept="image/*"
                           id="dashboard-logo-upload"
                           onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const { processImage } = await import('../../lib/imageUtils');
                               const compressed = await processImage(file, { maxWidth: 500, maxHeight: 500 });
                               setLogoUrl(compressed);
                             }
                           }}
                           className="hidden" 
                        />
                        <label htmlFor="dashboard-logo-upload" className="flex items-center justify-center flex-col w-full px-6 py-4 bg-gray-50 border border-brand-olive/10 hover:border-brand-gold border-dashed rounded-full cursor-pointer hover:bg-gray-100 transition-all">
                          <span className="text-sm font-bold text-brand-olive flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> Upload Logo</span>
                          <span className="text-[10px] text-gray-400 mt-1">Auto-resized to max 500x500px</span>
                        </label>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 px-4">Free Shipping Threshold (₹)</label>
                     <input 
                        type="number" 
                        value={shippingThreshold}
                        onChange={(e) => setShippingThreshold(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-all" 
                     />
                  </div>
                  
                  {logoUrl && (
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center space-y-4">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Logo Preview</p>
                      <img 
                        src={logoUrl} 
                        alt="Logo Preview" 
                        className="h-16 w-auto object-contain"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL")}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <button 
                    disabled={savingSettings}
                    type="submit"
                    className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-3"
                  >
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Store Settings</span>
                      </>
                    )}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
