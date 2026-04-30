import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Check, X, Trash2, ImageIcon } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function AdminReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status });
      showToast(`Review ${status} successfully.`, 'success');
      fetchReviews();
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review entirely?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      showToast('Review deleted successfully.', 'info');
      fetchReviews();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete review", 'error');
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-serif">Loading reviews...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-4xl font-serif font-bold text-brand-olive tracking-tight">Customer Reviews</h1>
            <p className="text-gray-400 mt-2">Manage customer testimonials and product reviews.</p>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-brand-olive/5 overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-gray-50/50">
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-brand-olive">Product</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-brand-olive">User</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-brand-olive">Review</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-brand-olive">Status</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-brand-olive text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {reviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50/20 transition-colors">
                     <td className="p-6">
                        <div className="font-bold text-gray-900 line-clamp-1 w-32">{review.productName}</div>
                     </td>
                     <td className="p-6">
                        <div className="font-medium text-gray-900">{review.userName}</div>
                        <div className="text-xs text-gray-400">{review.rating} / 5 Stars</div>
                     </td>
                     <td className="p-6 max-w-xs">
                        <div className="text-sm text-gray-600 line-clamp-2">{review.comment}</div>
                        {review.images && review.images.length > 0 && (
                           <div className="flex space-x-2 mt-2">
                              {review.images.map((img: string, i: number) => (
                                 <a key={i} href={img} target="_blank" rel="noreferrer">
                                    <img src={img} alt="Review" className="w-8 h-8 rounded object-cover border" />
                                 </a>
                              ))}
                           </div>
                        )}
                     </td>
                     <td className="p-6">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${
                           review.status === 'approved' ? 'bg-green-100 text-green-700' :
                           review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                           'bg-yellow-100 text-yellow-700'
                        }`}>
                           {review.status}
                        </span>
                     </td>
                     <td className="p-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <button onClick={() => handleUpdateStatus(review.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Approve">
                              <Check className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleUpdateStatus(review.id, 'rejected')} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full" title="Reject">
                              <X className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(review.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
               {reviews.length === 0 && (
                  <tr>
                     <td colSpan={5} className="p-12 text-center text-gray-400 italic">No reviews found.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
