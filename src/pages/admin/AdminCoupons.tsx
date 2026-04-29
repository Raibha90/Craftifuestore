import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Coupon } from '../../types';
import { Plus, Trash2, Tag, Check, X, Calendar, Ticket, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

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

  const handleGenerateAICoupons = async () => {
    try {
      setGeneratingAI(true);
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "As an expert E-commerce Marketer in India, analyze upcoming public events, holidays, or seasons within the next 3 months. Generate 3 unique discount coupons. Format as JSON array: [{code: 'DIWALI20', discountType: 'percentage', discountValue: 20, minPurchase: 1000, expiryDate: 'YYYY-MM-DD'}]. Omit markdown."
      });

      let text = result.text || '[]';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedCoupons = JSON.parse(text);

      for (const coupon of generatedCoupons) {
        await addDoc(collection(db, 'coupons'), {
          ...coupon,
          code: coupon.code.toUpperCase(),
          active: true,
          createdAt: serverTimestamp()
        });
      }

      fetchCoupons();
    } catch (e: any) {
      console.error(e);
      alert('AI Generation Failed: ' + e.message);
    } finally {
      setGeneratingAI(false);
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
          onClick={handleGenerateAICoupons}
          disabled={generatingAI}
          className="flex items-center space-x-3 bg-brand-gold text-brand-olive px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all group disabled:opacity-50"
        >
          {generatingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />}
          <span>{generatingAI ? 'Generating AI Coupons...' : 'Generate Coupons AI'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading || generatingAI ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
             <p className="text-gray-400 font-serif italic text-lg">{generatingAI ? 'AI is analyzing web events & trends...' : 'Validating codes...'}</p>
          </div>
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
    </div>
  );
}
