import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Percent, 
  TrendingUp, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Settings, 
  Save, 
  Loader2,
  Calendar,
  History,
  ShieldCheck,
  Building2,
  Gem
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../../components/Toast';

interface CommissionRate {
  id: string;
  category: string;
  rate: number;
  lastUpdated: string;
}

interface CommissionPayout {
  id: string;
  vendorId: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
}

export default function AdminCommissions() {
  const { showToast } = useToast();
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 125400,
    totalPending: 45200,
    activeVendors: 24,
    avgRate: 12.5
  });

  useEffect(() => {
    const unsubRates = onSnapshot(collection(db, 'commission_rates'), (snap) => {
      if (snap.empty) {
        // Seed default rates if none exist
        const defaultRates = [
          { id: 'bamboo', category: 'Bamboo Products', rate: 15, lastUpdated: new Date().toISOString() },
          { id: 'jewelry', category: 'Handmade Jewelry', rate: 20, lastUpdated: new Date().toISOString() },
          { id: 'home_decor', category: 'Home & Decor', rate: 12, lastUpdated: new Date().toISOString() },
          { id: 'ceramics', category: 'Ceramics', rate: 18, lastUpdated: new Date().toISOString() }
        ];
        defaultRates.forEach(r => setDoc(doc(db, 'commission_rates', r.id), r));
      } else {
        setRates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionRate)));
      }
      setLoading(false);
    });

    const unsubPayouts = onSnapshot(query(collection(db, 'commission_payouts'), orderBy('date', 'desc'), limit(5)), (snap) => {
      setPayouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionPayout)));
    });

    return () => {
      unsubRates();
      unsubPayouts();
    };
  }, []);

  const handleUpdateRate = async (id: string, newRate: number) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'commission_rates', id), {
        rate: newRate,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      showToast('Commission rate updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to update rate.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Commission Management</h1>
          <p className="text-gray-400 mt-2">Oversee heritage marketplace fees and vendor earnings structures.</p>
        </div>
        <div className="flex items-center space-x-2 bg-brand-gold/10 px-4 py-2 rounded-full border border-brand-gold/20">
          <TrendingUp className="w-4 h-4 text-brand-gold" />
          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">+4.2% from last month</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Earnings', value: `₹${stats.totalEarned.toLocaleString()}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Payouts', value: `₹${stats.totalPending.toLocaleString()}`, icon: ArrowUpRight, color: 'text-brand-gold', bg: 'bg-brand-gold/5' },
          { label: 'Active Artisans', value: stats.activeVendors, icon: Users, color: 'text-brand-olive', bg: 'bg-brand-olive/5' },
          { label: 'Avg. Commission', value: `${stats.avgRate}%`, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-serif font-bold text-brand-olive">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commission Rates Card */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-brand-olive/5 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-brand-olive" />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-olive">Category Rates</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Marketplace Standard</span>
          </div>

          <div className="space-y-4">
            {rates.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl group hover:bg-brand-olive/5 transition-all">
                <div className="flex items-center space-x-4">
                   <div className="w-2 h-12 bg-brand-gold/20 rounded-full" />
                   <div>
                      <h4 className="font-bold text-brand-olive">{rate.category}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Updated {new Date(rate.lastUpdated).toLocaleDateString()}
                      </p>
                   </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <input 
                      type="number"
                      className="w-24 px-4 py-3 bg-white border border-transparent rounded-xl focus:border-brand-gold outline-none font-bold text-brand-olive"
                      value={rate.rate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRates(prev => prev.map(r => r.id === rate.id ? { ...r, rate: val } : r));
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                  <button 
                    onClick={() => handleUpdateRate(rate.id, rate.rate)}
                    disabled={saving}
                    className="p-3 bg-brand-olive text-brand-cream rounded-xl hover:bg-brand-gold transition-colors shadow-lg shadow-brand-olive/10"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logic Insight Card */}
        <div className="bg-brand-olive text-brand-cream rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-brand-gold" />
               </div>
               <h3 className="text-xl font-serif font-bold italic">The Core Logic</h3>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Transparent Deductions', desc: 'Commissions are calculated on the pre-tax checkout amount, excluding shipping fees.', icon: Building2 },
                { title: 'Artisan Protection', desc: 'Bulk order commissions are capped at 8% to promote heritage growth and scalability.', icon: Gem },
                { title: 'Payment Integrity', desc: 'Secure settlement cycle every 14 days after successful product delivery verification.', icon: History }
              ].map((item, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="mt-1"><item.icon className="w-4 h-4 text-brand-gold" /></div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-widest">{item.title}</h5>
                    <p className="text-sm text-brand-cream/60 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10">
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-gold italic">Strategy for 2024</p>
               <p className="text-sm mt-2 font-serif opacity-80 leading-relaxed italic">"Our priority is supporting the hands that create. Commission logic is secondary to craftsman survival."</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
         <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold text-brand-olive">Recent Settlements</h3>
            <button className="text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center">
              View All History
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="text-left border-b border-gray-50">
                    <th className="pb-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Settlement ID</th>
                    <th className="pb-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Artisan/Vendor</th>
                    <th className="pb-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Amount</th>
                    <th className="pb-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                    <th className="pb-6 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {payouts.map((p) => (
                    <tr key={p.id} className="group">
                      <td className="py-6 font-mono text-xs text-gray-400">#{p.id.substring(0, 8)}</td>
                      <td className="py-6 font-bold text-brand-olive">Vendor #{p.vendorId.substring(0, 4)}</td>
                      <td className="py-6 font-bold text-brand-olive font-mono">₹{p.amount.toLocaleString()}</td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-brand-gold/10 text-brand-gold'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-6 text-right text-xs text-gray-400">{new Date(p.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-12 text-center text-gray-400 italic">No recent commission settlements recorded.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
