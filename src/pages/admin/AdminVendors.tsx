import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin, Star, ExternalLink, Instagram, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../components/Toast';

interface Vendor {
  id: string;
  name: string;
  category: string;
  tags: string[];
  city: string;
  country: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  quality_score: number;
  rating: number;
  review_count: number;
  source: string;
  status: 'pending' | 'approved' | 'rejected';
  commission_rate?: number;
}

export default function AdminVendors() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: '',
    category: 'jewelry',
    tags: [],
    city: '',
    country: 'India',
    phone: '',
    email: '',
    whatsapp: '',
    instagram: '',
    quality_score: 80,
    rating: 4.5,
    review_count: 0,
    source: 'manual',
    status: 'pending',
    commission_rate: 15
  });

  const categories = ['jewelry', 'home_decor', 'pottery', 'textiles'];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // NOTE: since we might not have 'vendors' initialized, let's just fetch
      const q = query(collection(db, 'vendors'), orderBy('quality_score', 'desc'));
      const snapshot = await getDocs(q);
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor)));
    } catch (err) {
      console.error(err);
      // In case collection doesn't exist yet, just have an empty array
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async () => {
    try {
      if (editingVendor) {
        await updateDoc(doc(db, 'vendors', editingVendor.id), { ...newVendor });
        showToast('Vendor updated successfully.', 'success');
      } else {
        await addDoc(collection(db, 'vendors'), {
          ...newVendor,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        showToast('Vendor added successfully.', 'success');
      }
      setIsModalOpen(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (err) {
      console.error(err);
      showToast('Failed to save vendor', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await deleteDoc(doc(db, 'vendors', id));
      showToast('Vendor deleted successfully.', 'info');
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateDoc(doc(db, 'vendors', id), { status });
      showToast(`Vendor ${status}.`, 'info');
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? v.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-olive tracking-tight">Vendor Search Module</h1>
          <p className="text-brand-olive/60 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Data Acquisition & AI Pipeline</p>
        </div>
        <button 
          onClick={() => {
            setEditingVendor(null);
            setNewVendor({ name: '', category: 'jewelry', tags: [], city: '', country: 'India', phone: '', email: '', whatsapp: '', instagram: '', quality_score: 50, rating: 0, review_count: 0, source: 'manual', status: 'pending', commission_rate: 15 });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-brand-olive text-brand-cream px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/90 transition-all shadow-xl hover:shadow-brand-olive/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manual Vendor</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-brand-olive/5 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none text-brand-olive font-medium"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-brand-olive font-serif animate-pulse">Loading vendor data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-[2rem] p-6 shadow-xl border border-brand-olive/5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-serif">{vendor.name || 'Unnamed Vendor'}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{vendor.category} • {vendor.city || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center bg-gray-50 rounded-xl p-2 px-3 border border-gray-100">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-widest">Commission</span>
                      <span className="text-lg font-bold text-brand-gold">
                        {vendor.commission_rate !== undefined ? `${vendor.commission_rate}%` : '15%'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 rounded-xl p-2 px-3 border border-gray-100">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-widest">Score</span>
                      <span className={`text-lg font-bold ${vendor.quality_score >= 80 ? 'text-green-600' : vendor.quality_score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {vendor.quality_score || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                    vendor.status === 'approved' ? 'bg-green-100 text-green-700' :
                    vendor.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {vendor.status}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Source: <span className="uppercase">{vendor.source || 'Unknown'}</span></span>
                  {vendor.rating > 0 && <span className="flex items-center text-xs font-bold text-brand-gold"><Star className="w-3 h-3 fill-current mr-1" /> {vendor.rating}</span>}
                </div>

                {vendor.tags && vendor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {vendor.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-gray-500">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center space-x-1 hover:text-brand-olive text-xs" title={vendor.phone}>
                      <Phone className="w-3 h-3" /> <span className="truncate">{vendor.phone}</span>
                    </a>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center space-x-1 hover:text-brand-olive text-xs" title={vendor.email}>
                      <Mail className="w-3 h-3" /> <span className="truncate">Email</span>
                    </a>
                  )}
                  {vendor.whatsapp && (
                    <a href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-brand-olive text-xs">
                      <MessageSquare className="w-3 h-3" /> <span>WhatsApp</span>
                    </a>
                  )}
                  {vendor.instagram && (
                    <a href={`https://instagram.com/${vendor.instagram}`} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-brand-olive text-xs">
                      <Instagram className="w-3 h-3" /> <span>{vendor.instagram}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {vendor.status !== 'approved' && (
                      <button onClick={() => updateStatus(vendor.id, 'approved')} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
                        Approve
                      </button>
                    )}
                    {vendor.status !== 'rejected' && (
                      <button onClick={() => updateStatus(vendor.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">
                        Reject
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setEditingVendor(vendor);
                        setNewVendor(vendor);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-brand-olive hover:bg-brand-olive/5 rounded-xl transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(vendor.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-1 lg:col-span-2 text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-400 font-serif text-lg">No vendors found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal manually add / edit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-olive/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-brand-olive">
                    {editingVendor ? 'Edit Vendor' : 'Add Manual Vendor'}
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mt-1 mb-2">Vendor Master Integration</p>
                  <p className="text-xs text-red-500 font-medium tracking-normal">Fields marked with <span className="font-bold">(*)</span> are mandatory.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <ExternalLink className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Business Name <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.name}
                    onChange={e => setNewVendor({...newVendor, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Category <span className="text-red-500 font-bold text-xs ml-1">(*)</span></label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.category}
                    onChange={e => setNewVendor({...newVendor, category: e.target.value})} 
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">City</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.city}
                    onChange={e => setNewVendor({...newVendor, city: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Country</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.country}
                    onChange={e => setNewVendor({...newVendor, country: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Phone</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.phone}
                    onChange={e => setNewVendor({...newVendor, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email</label>
                  <input type="email" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.email}
                    onChange={e => setNewVendor({...newVendor, email: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">WhatsApp</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.whatsapp}
                    onChange={e => setNewVendor({...newVendor, whatsapp: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Instagram</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.instagram}
                    onChange={e => setNewVendor({...newVendor, instagram: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Tags (Comma separated)</label>
                  <input type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={(newVendor.tags || []).join(', ')}
                    onChange={e => setNewVendor({...newVendor, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Commission Rate (%)</label>
                  <input type="number" 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.commission_rate !== undefined ? newVendor.commission_rate : 15}
                    onChange={e => setNewVendor({...newVendor, commission_rate: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.1" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none" 
                    value={newVendor.status}
                    onChange={e => setNewVendor({...newVendor, status: e.target.value as any})} 
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold uppercase tracking-widest text-xs text-gray-500 hover:text-brand-olive transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveVendor}
                  className="bg-brand-olive text-brand-cream px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-olive/90 transition-all shadow-xl"
                  disabled={!newVendor.name || !newVendor.category}
                >
                  Save Vendor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
