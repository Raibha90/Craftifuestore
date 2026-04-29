import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CreditCard, Loader2, Eye, Calendar, DollarSign, Filter, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  timestamp: string;
  customerName: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // In a real scenario, this would query a dedicated 'payments' collection
      // or derive from 'orders'. For the UI representation we will fetch orders
      // and map them to payment representations.
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      
      const paymentData = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: `pay_${doc.id}`,
          orderId: doc.id,
          amount: data.totalAmount || 0,
          currency: 'INR',
          status: data.paymentStatus || 'completed',
          method: data.paymentMethod || 'Credit Card',
          timestamp: data.createdAt,
          customerName: data.address?.fullName || 'Guest Customer'
        };
      });
      setPayments(paymentData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-32">
       <div>
        <h1 className="text-4xl font-serif font-bold text-brand-olive tracking-tight">Payments History</h1>
        <p className="text-gray-500 mt-2">Monitor transactions, refunds, and financial logs.</p>
       </div>

       {/* Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-3xl border border-brand-olive/10 shadow-sm flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-olive/5 flex items-center justify-center">
               <DollarSign className="w-8 h-8 text-brand-olive" />
            </div>
            <div>
               <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Total Revenue</p>
               <p className="text-3xl font-serif font-bold text-brand-olive">Rs. {payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-brand-olive/10 shadow-sm flex items-center space-x-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
               <CreditCard className="w-8 h-8 text-brand-gold" />
            </div>
            <div>
               <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Transactions</p>
               <p className="text-3xl font-serif font-bold text-brand-olive">{payments.length}</p>
            </div>
         </div>
       </div>

       {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
       ) : (
         <div className="bg-white rounded-[2rem] border border-brand-olive/10 overflow-hidden shadow-sm">
           <div className="p-6 border-b border-brand-olive/10 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-brand-olive uppercase tracking-widest text-[10px]">Payment Logs</h3>
             <button className="flex items-center space-x-2 text-gray-500 hover:text-brand-olive text-[10px] font-bold uppercase tracking-widest">
               <Filter className="w-4 h-4" />
               <span>Filter</span>
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100">
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction ID</th>
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date/Time</th>
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                   <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
                 </tr>
               </thead>
               <tbody>
                 {payments.map(payment => (
                   <tr key={payment.id} className="border-b border-gray-50 hover:bg-brand-olive/5 transition-colors">
                     <td className="p-6">
                       <span className="font-mono text-xs text-brand-olive">{payment.id.substring(0, 12)}...</span>
                     </td>
                     <td className="p-6">
                       <span className="font-bold text-sm text-gray-700">{payment.customerName}</span>
                     </td>
                     <td className="p-6">
                       <div className="flex items-center space-x-2 text-gray-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(payment.timestamp).toLocaleDateString()}</span>
                       </div>
                     </td>
                     <td className="p-6">
                       <span className="font-bold text-brand-olive">Rs. {payment.amount.toLocaleString()}</span>
                     </td>
                     <td className="p-6">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {payment.status}
                       </span>
                     </td>
                     <td className="p-6 text-right">
                       <button 
                         onClick={() => setSelectedPayment(payment)}
                         className="inline-flex items-center justify-center p-3 hover:bg-white rounded-full transition-colors group shadow-sm bg-gray-50 border border-transparent hover:border-brand-gold"
                       >
                         <Eye className="w-4 h-4 text-gray-400 group-hover:text-brand-gold" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {/* Payment Detail Modal */}
       <AnimatePresence>
          {selectedPayment && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-olive/40 backdrop-blur-md"
                onClick={() => setSelectedPayment(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-8"
              >
                 <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-3xl flex items-center justify-center text-brand-gold">
                       <CreditCard className="w-8 h-8" />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedPayment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {selectedPayment.status}
                    </span>
                 </div>

                 <div>
                    <h3 className="font-serif text-3xl font-bold text-brand-olive">Rs. {selectedPayment.amount.toLocaleString()}</h3>
                    <p className="text-gray-500 text-sm mt-1">Paid via {selectedPayment.method}</p>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex justify-between">
                       <span className="text-gray-400 text-sm">Transaction ID</span>
                       <span className="font-mono text-sm">{selectedPayment.id}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 text-sm">Order ID</span>
                       <span className="font-mono text-sm hover:underline cursor-pointer flex items-center text-brand-gold">
                         {selectedPayment.orderId.substring(0, 8)}... <ExternalLink className="w-3 h-3 ml-1" />
                       </span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 text-sm">Customer</span>
                       <span className="font-medium text-brand-olive">{selectedPayment.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400 text-sm">Date</span>
                       <span className="font-medium text-brand-olive">{new Date(selectedPayment.timestamp).toLocaleString()}</span>
                    </div>
                 </div>

                 <button 
                   onClick={() => setSelectedPayment(null)}
                   className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-brand-olive font-bold uppercase tracking-widest text-[10px] rounded-full transition-colors"
                 >
                    Close Log
                 </button>
              </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
}
