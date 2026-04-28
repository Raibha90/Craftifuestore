import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Coupon } from '../../types';
import { Plus, Trash2, Tag, Check, X, Calendar, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minPurchase: 0,
    expiryDate: '',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      setCoupons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, expiryDate: '', active: true });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('Error adding coupon');
    }
  };

  const toggleCouponActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { active: !currentStatus });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Discard this privilege code?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Privilege Codes</h1>
          <p className="text-gray-400 mt-2">Manage discounts and seasonal offers for your patrons.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-3 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Create Coupon</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full p-24 text-center text-gray-400 text-sm">Validating codes...</div>
        ) : coupons.length > 0 ? (
          coupons.map((coupon) => (
            <motion.div 
              key={coupon.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-white rounded-[2.5rem] border ${coupon.active ? 'border-brand-olive/5 shadow-sm' : 'border-gray-200 opacity-60 grayscale'} overflow-hidden group`}
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-2xl flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleCouponActive(coupon.id, coupon.active)}
                      className={`p-2 rounded-full transition-colors ${coupon.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {coupon.active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-brand-olive tracking-tight underline decoration-brand-gold/30 underline-offset-8">
                    {coupon.code}
                  </h3>
                  <div className="mt-4 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-brand-gold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Discount</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Min. Order</p>
                    <p className="font-bold text-brand-olive text-sm">₹{coupon.minPurchase?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Expires</p>
                    <div className="flex items-center space-x-2 text-brand-olive text-sm font-bold">
                      <Calendar className="w-3 h-3 text-brand-gold" />
                      <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
            <Tag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 italic">No active promotions. Craft your first reward.</p>
          </div>
        )}
      </div>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-olive/20 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-2xl font-bold text-brand-olive">New Privilege Code</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddCoupon} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Coupon Code</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. WELCOME25"
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal" 
                      value={newCoupon.code} 
                      onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Type</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                        value={newCoupon.discountType}
                        onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Value</label>
                      <input 
                        type="number" 
                        required 
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                        value={newCoupon.discountValue} 
                        onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Min. spend (₹)</label>
                      <input 
                        type="number" 
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                        value={newCoupon.minPurchase} 
                        onChange={e => setNewCoupon({...newCoupon, minPurchase: Number(e.target.value)})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Expiry Date</label>
                      <input 
                        type="date" 
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                        value={newCoupon.expiryDate} 
                        onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all">
                  Activate Coupon
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
