import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  BookOpen, 
  Calculator, 
  Layers, 
  BarChart3, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  Search,
  ChevronDown,
  Filter,
  Package,
  TrendingUp,
  IndianRupee,
  Activity,
  Image as ImageIcon,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Types ---
interface JewelleryItem {
  sku: string;
  productName: string;
  category: string;
  subCategory: string;
  collection: string;
  metal: string;
  purity: string;
  grossWt: number;
  netWt: number;
  stoneType: string;
  stoneWt: number;
  metalRate: number;
  stoneValue: number;
  makingPercent: number;
  discountPercent: number;
  stockQty: number;
  imageUrl: string;
  status: 'Active' | 'Inactive' | 'Sold Out';
  // Calculated
  metalValue: number;
  makingCharges: number;
  subtotal: number;
  gst: number;
  mrp: number;
  sellingPrice: number;
  stockValue: number;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
}

const CATEGORIES = ['Necklace', 'Earrings', 'Rings', 'Bangles', 'Bracelets', 'Pendants', 'Sets'];
const METALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold'];
const PURITIES = ['14K', '18K', '22K', '24K', '925 Silver'];
const COLLECTIONS = ['Heritage', 'Modern', 'Wedding', 'Temple', 'Minimalist'];

export default function AdminWorkbook() {
  const [activeTab, setActiveTab] = useState<'master' | 'lookbook' | 'calculator' | 'collections' | 'dashboard'>('master');
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<JewelleryItem> | null>(null);
  const [search, setSearch] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Formula logic
  const calculateDerived = (item: Partial<JewelleryItem>): Partial<JewelleryItem> => {
    const netWt = item.netWt || 0;
    const metalRate = item.metalRate || 0;
    const stoneValue = item.stoneValue || 0;
    const makingPercent = item.makingPercent || 0;
    const discountPercent = item.discountPercent || 0;
    const stockQty = item.stockQty || 0;

    const metalValue = netWt * metalRate;
    const makingCharges = (metalValue * makingPercent) / 100;
    const subtotal = metalValue + stoneValue + makingCharges;
    const gst = subtotal * 0.03;
    const mrp = subtotal + gst;
    const sellingPrice = mrp * (1 - discountPercent / 100);
    const stockValue = sellingPrice * stockQty;

    return {
      ...item,
      metalValue,
      makingCharges,
      subtotal,
      gst,
      mrp,
      sellingPrice,
      stockValue
    };
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'jewellery_master'), orderBy('sku', 'asc')), (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JewelleryItem));
      setItems(fetched);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'jewellery_master'));
    return () => unsub();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.sku) return;

    const calculated = calculateDerived(editingItem) as JewelleryItem;
    
    try {
      await setDoc(doc(db, 'jewellery_master', calculated.sku), {
        ...calculated,
        updatedAt: new Date().toISOString(),
        createdAt: calculated.id ? (items.find(i => i.sku === calculated.sku)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      }, { merge: true });
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `jewellery_master/${calculated.sku}`);
    }
  };

  const handleDeleteItem = async (sku: string) => {
    if (!window.confirm('Delete this SKU?')) return;
    try {
      await deleteDoc(doc(db, 'jewellery_master', sku));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `jewellery_master/${sku}`);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!aiPrompt && !editingItem?.productName) {
      alert('Please provide a prompt or product name.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const prompt = aiPrompt || `A professional high-end jewellery photograph of ${editingItem?.productName}, ${editingItem?.metal} ${editingItem?.purity}, ${editingItem?.category}. Studio lighting, elegant display, photorealistic.`;
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: prompt }],
      });

      let foundImage = false;
      for (const candidate of result.candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64}`;
            setEditingItem({ ...editingItem, imageUrl });
            foundImage = true;
            break;
          }
        }
        if (foundImage) break;
      }

      if (!foundImage) {
        throw new Error('No image was generated. Please try again.');
      }
      
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-olive tracking-tight">Jewellery Lookbook Workbook</h1>
          <p className="text-brand-olive/60 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Single source of truth for your craft</p>
        </div>
        <div className="flex items-center space-x-2 bg-white/50 p-1.5 rounded-2xl border border-brand-olive/5 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'master', label: 'Master Data', icon: Database },
            { id: 'lookbook', label: 'Catalog View', icon: BookOpen },
            { id: 'calculator', label: 'Pricing logic', icon: Calculator },
            { id: 'collections', label: 'Collections', icon: Layers },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-brand-olive text-brand-cream shadow-xl transform -translate-y-0.5' 
                : 'text-brand-olive/40 hover:text-brand-olive hover:bg-brand-olive/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[500px]"
        >
          {activeTab === 'master' && (
            <div className="bg-white rounded-[3rem] border border-brand-olive/5 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-brand-olive/5 flex flex-col md:flex-row justify-between gap-6">
                 <div className="relative flex-grow max-w-md">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-olive/30" />
                   <input 
                     type="text" 
                     placeholder="Search SKU or Product Name..." 
                     className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm font-medium"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                   />
                 </div>
                 <button 
                   onClick={() => setEditingItem({ status: 'Active', category: 'Necklace', metal: 'Gold', purity: '18K', stockQty: 1, makingPercent: 12, discountPercent: 0 })}
                   className="flex items-center space-x-3 px-8 py-4 bg-brand-olive text-brand-cream rounded-2xl hover:bg-brand-gold hover:text-brand-olive transition-all font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-brand-olive/20"
                 >
                   <Plus className="w-4 h-4" />
                   <span>Add New SKU</span>
                 </button>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[2000px]">
                   <thead className="bg-brand-olive/[0.02] border-b border-brand-olive/5">
                     <tr>
                       {[
                         'SKU', 'Image', 'Name', 'Category', 'Collection', 'Metal', 'Purity', 
                         'Gross Wt', 'Net Wt', 'Stone', 'Stone Wt', 'Metal Rate', 'Stone Val',
                         'Making %', 'Discount %', 'Stock', 'MRP', 'Selling Price', 'Actions'
                       ].map(h => (
                         <th key={h} className="px-6 py-5 text-[10px] uppercase font-black text-brand-olive/40 tracking-[0.2em]">{h}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-olive/5">
                     {items.filter(i => i.sku.toLowerCase().includes(search.toLowerCase()) || i.productName.toLowerCase().includes(search.toLowerCase())).map(item => (
                       <tr key={item.sku} className="hover:bg-brand-cream/10 transition-colors group">
                         <td className="px-6 py-5">
                            <span className="font-mono text-xs font-bold text-brand-olive bg-brand-olive/5 px-3 py-1 rounded-full">{item.sku}</span>
                         </td>
                         <td className="px-6 py-5">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-brand-olive/5">
                               {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-3 text-gray-300" />}
                            </div>
                         </td>
                         <td className="px-6 py-5 text-sm font-bold text-brand-olive">{item.productName}</td>
                         <td className="px-6 py-5 text-xs text-gray-500">{item.category}</td>
                         <td className="px-6 py-5 text-xs text-gray-500 italic">{item.collection}</td>
                         <td className="px-6 py-5 text-xs font-bold text-brand-olive/70">{item.metal}</td>
                         <td className="px-6 py-5 text-xs text-brand-gold font-bold">{item.purity}</td>
                         <td className="px-6 py-5 text-xs text-gray-500">{item.grossWt}g</td>
                         <td className="px-6 py-5 text-xs font-bold text-brand-olive">{item.netWt}g</td>
                         <td className="px-6 py-5 text-xs text-gray-500">{item.stoneType}</td>
                         <td className="px-6 py-5 text-xs text-gray-500">{item.stoneWt}ct</td>
                         <td className="px-6 py-5 text-xs font-bold text-blue-600">₹{item.metalRate.toLocaleString()}</td>
                         <td className="px-6 py-5 text-xs text-gray-500">₹{item.stoneValue.toLocaleString()}</td>
                         <td className="px-6 py-5 text-xs text-gray-500">{item.makingPercent}%</td>
                         <td className="px-6 py-5 text-xs text-red-500">-{item.discountPercent}%</td>
                         <td className="px-6 py-5">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${item.stockQty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {item.stockQty} In Stock
                            </span>
                         </td>
                         <td className="px-6 py-5 text-xs font-bold text-gray-400 line-through">₹{Math.round(item.mrp).toLocaleString()}</td>
                         <td className="px-6 py-5 text-xs font-bold text-brand-olive">₹{Math.round(item.sellingPrice).toLocaleString()}</td>
                         <td className="px-6 py-5">
                           <div className="flex space-x-2">
                             <button onClick={() => setEditingItem(item)} className="p-2 hover:bg-brand-olive hover:text-brand-cream rounded-lg transition-all"><Plus className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteItem(item.sku)} className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'lookbook' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {items.filter(i => i.status === 'Active').map(item => (
                 <div key={item.sku} className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-xl overflow-hidden group">
                   <div className="aspect-square relative overflow-hidden bg-gray-100">
                     {item.imageUrl ? (
                       <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300">
                         <ImageIcon size={48} />
                       </div>
                     )}
                     <div className="absolute top-6 left-6">
                        <span className="bg-brand-olive/90 backdrop-blur-md text-brand-cream text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                           {item.sku}
                        </span>
                     </div>
                   </div>
                   <div className="p-8 space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{item.category} • {item.metal} {item.purity}</p>
                          <h3 className="font-serif text-lg font-bold text-brand-olive mt-1">{item.productName}</h3>
                        </div>
                     </div>
                     <div className="flex items-center space-x-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                       <span>{item.netWt}g Gold</span>
                       {item.stoneWt > 0 && <span>• {item.stoneWt}ct {item.stoneType}</span>}
                     </div>
                     <div className="pt-4 border-t border-brand-olive/5 flex items-baseline justify-between">
                       <span className="text-xs text-gray-400 line-through">₹{Math.round(item.mrp).toLocaleString()}</span>
                       <span className="text-lg font-serif font-bold text-brand-olive">₹{Math.round(item.sellingPrice).toLocaleString()}</span>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] border border-brand-olive/5 shadow-2xl space-y-10">
               <div className="text-center">
                 <h2 className="text-2xl font-serif font-bold text-brand-olive">Standalone Pricing Calculator</h2>
                 <p className="text-brand-olive/50 text-[10px] font-bold uppercase tracking-widest mt-2">Instant quotes for custom variations</p>
               </div>
               <CalculatorForm onCalculate={calculateDerived} />
            </div>
          )}

          {activeTab === 'collections' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from(new Set(items.map(i => i.collection))).filter(Boolean).map(coll => {
                  const collItems = items.filter(i => i.collection === coll);
                  const totalMRP = collItems.reduce((acc, curr) => acc + curr.mrp, 0);
                  const avgSellingPrice = totalMRP / (collItems.length || 1);
                  return (
                    <div key={coll} className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-serif font-bold text-brand-olive">{coll} Collection</h3>
                        <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{collItems.length} SKUs</span>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-brand-olive/5">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>Total Catalog Value</span>
                          <span className="text-brand-olive">₹{Math.round(totalMRP).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span>Avg Selling Price</span>
                          <span className="text-brand-olive">₹{Math.round(avgSellingPrice).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Active SKUs', value: items.filter(i => i.status === 'Active').length, icon: Package, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Total Stock', value: items.reduce((acc, curr) => acc + curr.stockQty, 0), icon: Layers, color: 'bg-indigo-50 text-indigo-600' },
                    { label: 'Inventory Value', value: `₹${Math.round(items.reduce((acc, curr) => acc + curr.stockValue, 0) / 100000)}L`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Avg Sale Price', value: `₹${Math.round(items.reduce((acc, curr) => acc + curr.sellingPrice, 0) / (items.length || 1)).toLocaleString()}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
                  ].map((stat, idx) => (stat && (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-brand-olive/5 shadow-xl flex items-center space-x-6">
                      <div className={`p-5 rounded-2xl ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-serif font-bold text-brand-olive">{stat.value}</p>
                      </div>
                    </div>
                  )))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-xl h-[400px]">
                    <h3 className="text-sm font-bold text-brand-olive uppercase tracking-[0.2em] mb-8">Value by Category</h3>
                    <ResponsiveContainer width="100%" height="80%">
                       <BarChart data={CATEGORIES.map(cat => ({ 
                         name: cat, 
                         value: Math.round(items.filter(i => i.category === cat).reduce((acc, curr) => acc + curr.stockValue, 0) / 1000)
                       }))}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} tickFormatter={(v) => `₹${v}k`} />
                         <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                         <Bar dataKey="value" fill="#1A2F23" radius={[8, 8, 0, 0]} barSize={40} />
                       </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-brand-olive/5 shadow-xl h-[400px]">
                    <h3 className="text-sm font-bold text-brand-olive uppercase tracking-[0.2em] mb-8">Stock Distribution</h3>
                    <ResponsiveContainer width="100%" height="80%">
                       <PieChart>
                         <Pie
                           data={METALS.map(metal => ({ 
                             name: metal, 
                             value: items.filter(i => i.metal === metal).length 
                           })).filter(v => v.value > 0)}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={100}
                           paddingAngle={8}
                           dataKey="value"
                         >
                           {METALS.map((_, index) => (
                             <Cell key={`cell-${index}`} fill={['#1A2F23', '#D4AF37', '#718355', '#B5A28C'][index % 4]} />
                           ))}
                         </Pie>
                         <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                       </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Entry Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-olive/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingItem(null)}
                className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-all"
              >
                <Plus className="w-6 h-6 rotate-45 text-brand-olive/30" />
              </button>

              <div className="mb-10">
                <h2 className="text-2xl font-serif font-bold text-brand-olive">
                  {items.find(i => i.sku === editingItem.sku) ? 'Edit Jewellery SKU' : 'New Jewellery Record'}
                </h2>
                <p className="text-brand-olive/50 text-[10px] font-bold uppercase tracking-widest mt-2 px-1">Fields in blue are required inputs</p>
              </div>

              <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">SKU *</label>
                  <input 
                    required
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all font-mono"
                    value={editingItem.sku || ''}
                    onChange={e => setEditingItem({...editingItem, sku: e.target.value})}
                    placeholder="GD-NK-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Product Name *</label>
                  <input 
                    required
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                    value={editingItem.productName || ''}
                    onChange={e => setEditingItem({...editingItem, productName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase font-black text-brand-olive/40 tracking-widest">Image URL</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsAiModalOpen(true);
                        setAiPrompt(editingItem.productName ? `A high-end professional studio photograph of ${editingItem.productName} (${editingItem.metal} ${editingItem.purity}), highly detailed, elegant lighting, clean lifestyle background, photorealistic.` : '');
                      }}
                      className="text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate AI</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <ImageIcon className="absolute left-6 w-4 h-4 text-brand-olive/30" />
                    <input 
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                      value={editingItem.imageUrl || ''}
                      onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  {editingItem.imageUrl && (
                    <div className="mt-2 flex items-center space-x-4 border border-brand-olive/5 p-2 rounded-2xl bg-gray-50/50">
                      <img src={editingItem.imageUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-brand-olive/10" referrerPolicy="no-referrer" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Preview</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none appearance-none"
                    value={editingItem.category || ''}
                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-brand-olive/40 tracking-widest ml-1">Collection</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none appearance-none"
                    value={editingItem.collection || ''}
                    onChange={e => setEditingItem({...editingItem, collection: e.target.value})}
                  >
                    <option value="">None</option>
                    {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none appearance-none"
                    value={editingItem.status || ''}
                    onChange={e => setEditingItem({...editingItem, status: e.target.value as any})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="md:col-span-3 h-px bg-brand-olive/5 my-4" />

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Metal</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.metal || ''}
                    onChange={e => setEditingItem({...editingItem, metal: e.target.value})}
                  >
                    {METALS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Purity</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.purity || ''}
                    onChange={e => setEditingItem({...editingItem, purity: e.target.value})}
                  >
                    {PURITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Net Wt (g) *</label>
                  <input 
                    required
                    type="number"
                    step="0.001"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.netWt || ''}
                    onChange={e => setEditingItem({...editingItem, netWt: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Metal Rate/g *</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.metalRate || ''}
                    onChange={e => setEditingItem({...editingItem, metalRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Stone Val</label>
                   <input 
                    type="number"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.stoneValue || ''}
                    onChange={e => setEditingItem({...editingItem, stoneValue: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Making %</label>
                  <input 
                    type="number"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.makingPercent || ''}
                    onChange={e => setEditingItem({...editingItem, makingPercent: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Discount %</label>
                  <input 
                    type="number"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.discountPercent || ''}
                    onChange={e => setEditingItem({...editingItem, discountPercent: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-black text-blue-500 tracking-widest ml-1">Stock Qty</label>
                   <input 
                    type="number"
                    className="w-full px-6 py-4 bg-blue-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none"
                    value={editingItem.stockQty || ''}
                    onChange={e => setEditingItem({...editingItem, stockQty: parseInt(e.target.value)})}
                  />
                </div>

                <div className="md:col-span-3 pt-8 flex justify-end space-x-4">
                   <button 
                     type="button" 
                     onClick={() => setEditingItem(null)} 
                     className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-brand-olive/40 hover:text-brand-olive transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="px-12 py-4 bg-brand-olive text-brand-cream rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-brand-gold hover:text-brand-olive transition-all flex items-center space-x-3"
                   >
                     <Save className="w-4 h-4" />
                     <span>Save Record</span>
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Image Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-olive/40 backdrop-blur-md"
              onClick={() => setIsAiModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-olive">Generate SKU Visual</h3>
                <p className="text-gray-400 text-sm">Create a professional catalog image for this SKU. Describe the plating, stones, and styling.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">AI Visual Prompt</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm leading-relaxed"
                  placeholder="e.g. 22K gold necklace with intricate filigree work, white background, soft shadow, sharp focus..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs text-gray-400 hover:text-brand-olive transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGenerateAIImage}
                  disabled={isGeneratingAi}
                  className="flex-1 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalculatorForm({ onCalculate }: { onCalculate: (item: any) => any }) {
  const [data, setData] = useState({
    netWt: 0,
    metalRate: 0,
    stoneValue: 0,
    makingPercent: 12,
    discountPercent: 0
  });

  const res = onCalculate(data);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 gap-6">
        <CalcField label="Net Wt (g)" value={data.netWt} onChange={v => setData({...data, netWt: parseFloat(v)})} />
        <CalcField label="Metal Rate" value={data.metalRate} onChange={v => setData({...data, metalRate: parseFloat(v)})} />
        <CalcField label="Stone Value" value={data.stoneValue} onChange={v => setData({...data, stoneValue: parseFloat(v)})} />
        <CalcField label="Making %" value={data.makingPercent} onChange={v => setData({...data, makingPercent: parseFloat(v)})} />
        <CalcField label="Discount %" value={data.discountPercent} onChange={v => setData({...data, discountPercent: parseFloat(v)})} />
      </div>
      
      <div className="bg-brand-olive rounded-[2.5rem] p-10 text-brand-cream space-y-6 shadow-2xl shadow-brand-olive/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest opacity-60">
           <span>Metal Value</span>
           <span>₹{Math.round(res.metalValue || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest opacity-60">
           <span>Making Charges</span>
           <span>₹{Math.round(res.makingCharges || 0).toLocaleString()}</span>
        </div>
        <div className="pt-6 border-t border-brand-cream/10 flex justify-between items-baseline">
           <div className="space-y-1">
             <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">Estimated MRP (Inc. 3% GST)</p>
             <p className="text-3xl font-serif font-bold italic">₹{Math.round(res.mrp || 0).toLocaleString()}</p>
           </div>
           {res.discountPercent > 0 && (
             <div className="text-right">
               <p className="text-[10px] uppercase font-bold tracking-widest text-red-300">Final Price (After {res.discountPercent}%)</p>
               <p className="text-xl font-serif font-bold text-brand-gold">₹{Math.round(res.sellingPrice || 0).toLocaleString()}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function CalcField({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-black text-brand-olive/40 tracking-widest ml-1">{label}</label>
      <input 
        type="number"
        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm font-bold"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
