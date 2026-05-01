import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, X, Search, ShoppingBag, Sparkles, Loader2, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../../components/Toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { processImage } from '../../lib/imageUtils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function VendorProducts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currentAiIdx, setCurrentAiIdx] = useState<number | null>(null);
  const [imageReqs, setImageReqs] = useState({ width: '800', height: '800', format: 'PNG' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Necklace',
    images: [''],
    stock: 0,
    material: '',
    seoTitle: '',
    tags: [] as string[],
    variants: [] as any[]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [generatingMeta, setGeneratingMeta] = useState(false);

  const handleGenerateMetadata = async () => {
    if (!newProduct.name) {
      showToast('Please enter at least a Product Name first.', 'info');
      return;
    }
    setGeneratingMeta(true);
    try {
      const prompt = `You are an expert e-commerce copywriter. Generate a compelling product description, SEO tags (list of strings), and an SEO title for this product:
      Name: ${newProduct.name}
      Category: ${newProduct.category}
      Material: ${newProduct.material}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              seoTitle: { type: Type.STRING }
            },
            required: ["description", "tags", "seoTitle"]
          }
        }
      });

      const text = response.text || "{}";
      const data = JSON.parse(text);

      setNewProduct(prev => ({
        ...prev,
        description: data.description || prev.description,
        tags: data.tags || prev.tags,
        seoTitle: data.seoTitle || prev.seoTitle
      }));
      showToast('AI Metadata generated successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error generating metadata: ' + err.message, 'error');
    } finally {
      setGeneratingMeta(false);
    }
  };

  const handleGenerateAIImage = async (idx: number) => {
    if (!aiPrompt && !newProduct.name) {
      alert('Please provide a prompt or at least a product name.');
      return;
    }

    setGeneratingAI(idx);
    try {
      const explicitInstruction = `Product photography, pure white background, studio lighting.`;
      const prompt = aiPrompt ? `${aiPrompt}. ${explicitInstruction}` : `A high-quality, professional product photograph of ${newProduct.name} - ${newProduct.material}. Elegant aesthetic, soft lighting, clean white background.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1'
        }
      });
      
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No image was generated. Please try again.');
      }

      const base64 = response.generatedImages[0].image.imageBytes;
      const rawImageUrl = `data:image/jpeg;base64,${base64}`;
      const res = await fetch(rawImageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'ai_generated.jpg', { type: 'image/jpeg' });
      const imageUrl = await processImage(file, { maxWidth: 800, maxHeight: 800, format: 'image/jpeg', quality: 0.7 });
      
      const newImages = [...newProduct.images];
      newImages[idx] = imageUrl;
      setNewProduct({ ...newProduct, images: newImages });

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          images: newImages,
          updatedAt: serverTimestamp()
        });
      }
      
      setIsAiModalOpen(false);
      setAiPrompt('');
      showToast('AI Image generated.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error: ' + err.message, 'error');
    } finally {
      setGeneratingAI(null);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), where('vendorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images.length > 0 ? product.images : [''],
      stock: product.stock,
      material: product.material || '',
      seoTitle: product.seoTitle || '',
      tags: product.tags || [],
      variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  const addVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [
        ...newProduct.variants,
        { id: Math.random().toString(36).substr(2, 9), name: '', type: 'size', stock: 0, price: undefined }
      ]
    });
  };

  const removeVariant = (id: string) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter(v => v.id !== id)
    });
  };

  const updateVariant = (id: string, field: string, value: any) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const productData = {
        ...newProduct,
        vendorId: user.uid,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        variants: newProduct.variants.map(v => ({
          ...v,
          stock: Number(v.stock),
          price: v.price ? Number(v.price) : undefined
        }))
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setNewProduct({ name: '', description: '', price: 0, category: 'Necklace', images: [''], stock: 0, material: '', seoTitle: '', tags: [], variants: [] });
      fetchProducts();
      showToast(`Product ${editingId ? 'updated' : 'added'} successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save product.', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
      showToast('Product deleted.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">My Product Catalog</h1>
          <p className="text-gray-400 mt-2">Manage your listings and showcase your craftsmanship.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-3 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all group shrink-0"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>New Product</span>
        </button>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search my products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-brand-olive/5 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-brand-gold/20 outline-none shadow-sm"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-6 py-4 bg-white border border-brand-olive/5 rounded-full text-xs font-bold uppercase tracking-widest outline-none shadow-sm cursor-pointer"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-brand-olive/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm">Loading your collection...</div>
        ) : filteredProducts.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Stock</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <Link to={`/product/${product.id}`} className="flex items-center space-x-4 hover:underline">
                      <img src={product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <span className="font-bold text-brand-olive">{product.name}</span>
                    </Link>
                  </td>
                  <td className="px-8 py-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">{product.category}</td>
                  <td className="px-8 py-6 font-bold text-brand-gold">₹{product.price.toLocaleString()}</td>
                  <td className="px-8 py-6 text-[10px] uppercase tracking-widest">
                    <span className={`px-2 py-1 rounded-lg font-bold ${product.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="p-2 text-gray-300 hover:text-brand-olive transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-24 text-center space-y-6">
            <ShoppingBag className="w-12 h-12 text-brand-olive/5 mx-auto" />
            <p className="text-gray-400 italic font-bold uppercase tracking-widest text-[10px]">Your catalog is empty.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
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
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-2xl font-bold text-brand-olive">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between bg-brand-gold/10 p-4 rounded-2xl">
                  <div>
                    <h4 className="font-serif font-bold text-brand-olive text-sm">AI Copilot</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Smart descriptions & tags</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleGenerateMetadata}
                    disabled={generatingMeta}
                    className="flex items-center space-x-2 bg-brand-gold text-brand-olive px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                  >
                    {generatingMeta ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    <span>Auto-Write</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Product Name</label>
                    <input type="text" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Description</label>
                    <textarea rows={3} required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold/30 outline-none transition-all text-sm font-medium" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Price (₹)</label>
                    <input type="number" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Stock</label>
                    <input type="number" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold/30 outline-none transition-all font-bold" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                  </div>
                  
                  {/* Images */}
                  <div className="space-y-4 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Product Images</label>
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="relative flex items-center">
                          <input 
                            type="url" 
                            required 
                            placeholder="Image URL"
                            className="w-full pl-6 pr-24 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold/30 outline-none transition-all text-xs font-bold" 
                            value={img} 
                            onChange={e => {
                              const newImages = [...newProduct.images];
                              newImages[idx] = e.target.value;
                              setNewProduct({...newProduct, images: newImages});
                            }} 
                          />
                          <div className="absolute right-4 flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`vendor-img-${idx}`}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const dataUrl = await processImage(file, { maxWidth: 800, maxHeight: 800 });
                                  const newImages = [...newProduct.images];
                                  newImages[idx] = dataUrl;
                                  setNewProduct({...newProduct, images: newImages});
                                }
                              }}
                            />
                            <label htmlFor={`vendor-img-${idx}`} className="p-2 cursor-pointer text-brand-gold"><Upload className="w-4 h-4" /></label>
                            <button type="button" onClick={() => {
                              setCurrentAiIdx(idx);
                              setIsAiModalOpen(true);
                              setAiPrompt(newProduct.name ? `Professional photo of ${newProduct.name}` : '');
                            }} className="text-brand-gold"><Sparkles className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variants */}
                  <div className="col-span-2 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-serif font-bold text-brand-olive text-lg">Variants</h4>
                      <button type="button" onClick={addVariant} className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">+ Add</button>
                    </div>
                    {newProduct.variants.map((v, idx) => (
                      <div key={v.id} className="grid grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-2xl relative">
                        <button type="button" onClick={() => removeVariant(v.id)} className="absolute -top-2 -right-2 text-red-500"><X className="w-3 h-3" /></button>
                        <select className="col-span-1 p-2 rounded-lg text-xs" value={v.type} onChange={e => updateVariant(v.id, 'type', e.target.value)}>
                          <option value="size">Size</option>
                          <option value="color">Color</option>
                        </select>
                        <input className="col-span-1 p-2 rounded-lg text-xs" placeholder="Name" value={v.name} onChange={e => updateVariant(v.id, 'name', e.target.value)} />
                        <input className="col-span-1 p-2 rounded-lg text-xs" type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(v.id, 'stock', e.target.value)} />
                        <input className="col-span-1 p-2 rounded-lg text-xs" type="number" placeholder="Price" value={v.price || ''} onChange={e => updateVariant(v.id, 'price', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">
                  {editingId ? 'Update Product' : 'Launch Masterpiece'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Image Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-olive/40 backdrop-blur-md" onClick={() => setIsAiModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-center">AI Visualizer</h3>
              <textarea rows={4} className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-bold font-sans" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
              <button onClick={() => handleGenerateAIImage(currentAiIdx!)} disabled={generatingAI !== null} className="w-full bg-brand-olive text-brand-cream py-4 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2">
                {generatingAI !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /><span>Generate</span></>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
