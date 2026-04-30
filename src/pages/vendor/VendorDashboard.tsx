import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Order, Product } from '../../types';
import { ShoppingCart, DollarSign, Package, TrendingUp, ShoppingBag, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    products: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchVendorStats = async () => {
      try {
        // Fetch vendor's products
        const productsQuery = query(collection(db, 'products'), where('vendorId', '==', user.uid));
        const productSnap = await getDocs(productsQuery);
        const productCount = productSnap.size;

        // Fetch all orders to filter those containing vendor's products
        // In a real large app, you'd have a separate vendor_orders collection for better indexing
        const orderSnap = await getDocs(collection(db, 'orders'));
        const allOrders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        const vendorOrders = allOrders.filter(order => 
          order.items.some(item => item.vendorId === user.uid)
        );

        const vendorRevenue = vendorOrders.reduce((sum, order) => {
          const vendorItems = order.items.filter(item => item.vendorId === user.uid);
          return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        }, 0);

        setStats({
          totalOrders: vendorOrders.length,
          revenue: vendorRevenue,
          products: productCount
        });

        // Sort by date and take top 5
        const sortedOrders = vendorOrders
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 5);
        
        setRecentOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching vendor stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorStats();
  }, [user]);

  const cards = [
    { label: 'My Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'My Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-brand-olive', bg: 'bg-brand-gold/10' },
    { label: 'Active Listings', value: stats.products, icon: Package, color: 'text-brand-olive', bg: 'bg-brand-olive/10' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Vendor Overview</h1>
        <p className="text-gray-400 mt-2">Manage your artisan business and track your success.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm space-y-4"
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
              <p className="text-3xl font-serif font-bold text-brand-olive mt-1">{card.value}</p>
            </div>
            <div className="flex items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Performance update</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl font-bold text-brand-olive">Recent Orders</h3>
            <div className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Latest activity</div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading vendor data...</div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-8 py-4">Order ID</th>
                    <th className="px-8 py-4">Vendor Share</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const vendorShare = order.items
                      .filter(item => item.vendorId === user?.uid)
                      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6 font-bold text-xs text-brand-olive uppercase tracking-tight">#{order.id.slice(-6)}</td>
                        <td className="px-8 py-6 font-bold text-sm">₹{vendorShare.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-brand-gold/10 text-brand-gold'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-24 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-gray-100 mx-auto" />
                <p className="text-gray-400 italic text-sm">No recent orders for your items yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Tips/Messages */}
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-brand-olive">Artisan Support</h3>
          <div className="space-y-4">
            {[
              { title: 'Optimization Tip', desc: 'Add detailed materials like "22K Gold" to improve search rankings.', icon: Package },
              { title: 'New Commission', desc: 'Cratifue has updated the bamboo decor commission rate to 12%.', icon: DollarSign },
              { title: 'Platform Update', desc: 'Secure payouts are now processed every Tuesday.', icon: Clock }
            ].map((tip, i) => (
              <div key={i} className="p-6 bg-white rounded-[2rem] border border-brand-olive/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-2">
                  <tip.icon className="w-4 h-4 text-brand-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">{tip.title}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-bold">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
