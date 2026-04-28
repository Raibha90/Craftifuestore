import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { Plus, Trash2, Edit2, Image as ImageIcon, X, Search, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currentAiIdx, setCurrentAiIdx] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Necklace',
    images: [''],
    stock: 0,
    material: '',
    variants: [] as any[]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const handleGenerateAIImage = async (idx: number) => {
    if (!aiPrompt && !newProduct.name) {
      alert('Please provide a prompt or at least a product name.');
      return;
    }

    setGeneratingAI(idx);
    try {
      const prompt = aiPrompt || `A high-quality, professional product photograph of ${newProduct.name} - ${newProduct.description}. Elegant, luxury jewellery aesthetic, soft lighting, clean background.`;
      
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
            const newImages = [...newProduct.images];
            newImages[idx] = imageUrl;
            setNewProduct({ ...newProduct, images: newImages });
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
      alert('Error generating image: ' + err.message);
    } finally {
      setGeneratingAI(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
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
    try {
      const productData = {
        ...newProduct,
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
      setNewProduct({ name: '', description: '', price: 0, category: 'Necklace', images: [''], stock: 0, material: '', variants: [] });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Artisan Catalog</h1>
          <p className="text-gray-400 mt-2">Curate and manage your fine collection of handcrafted treasures.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
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
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-3 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>New Masterpiece</span>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-brand-olive/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center text-gray-400 text-sm">Organizing catalog...</div>
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
                    <div className="flex items-center space-x-4">
                      <img src={product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <span className="font-bold text-brand-olive">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 uppercase tracking-widest">{product.category}</td>
                  <td className="px-8 py-6 font-medium">₹{product.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold leading-none ${product.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
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
            <p className="text-gray-400 italic">No products in catalog yet. Click "Add New Product" to start.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
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
                  {editingId ? 'Edit Treasure' : 'Add New Masterpiece'}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setNewProduct({ name: '', description: '', price: 0, category: 'Necklace', images: [''], stock: 0, material: '', variants: [] });
                  }} 
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Product Name</label>
                    <input type="text" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Description</label>
                    <textarea rows={3} required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Price (₹)</label>
                    <input type="number" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Category</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      {['Jewellery', 'Bangles', 'Rings', 'Handmade Sarees', 'Bamboo Home Decor', 'Lamps & Lighting'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Stock</label>
                    <input type="number" required className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Material</label>
                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" value={newProduct.material} onChange={e => setNewProduct({...newProduct, material: e.target.value})} />
                  </div>
                  
                  {/* Images Section */}
                  <div className="space-y-4 col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Product Images</label>
                      <button 
                        type="button" 
                        onClick={() => setNewProduct({...newProduct, images: [...newProduct.images, '']})}
                        className="text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:underline"
                      >
                        + Add Image URL
                      </button>
                    </div>
                    {newProduct.images.map((img, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="relative flex items-center">
                          <ImageIcon className="absolute left-6 w-4 h-4 text-gray-300" />
                          <input 
                            type="url" 
                            required 
                            placeholder="https://..."
                            className="w-full pl-14 pr-24 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all" 
                            value={img} 
                            onChange={e => {
                              const newImages = [...newProduct.images];
                              newImages[idx] = e.target.value;
                              setNewProduct({...newProduct, images: newImages});
                            }} 
                          />
                          <div className="absolute right-4 flex items-center space-x-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentAiIdx(idx);
                                setIsAiModalOpen(true);
                                setAiPrompt(newProduct.name ? `A professional studio product photograph of ${newProduct.name}, highly detailed, elegant lighting, plain background, photorealistic.` : '');
                              }}
                              disabled={generatingAI !== null}
                              className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all"
                              title="Generate with AI"
                            >
                              {generatingAI === idx ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                            {newProduct.images.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setNewProduct({...newProduct, images: newProduct.images.filter((_, i) => i !== idx)})}
                                className="p-2 text-red-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        {img && (
                          <div className="flex items-center space-x-4 ml-2">
                            <img src={img} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-brand-olive/10" referrerPolicy="no-referrer" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Image Preview</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Variants Section */}
                  <div className="col-span-2 pt-8 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-serif text-xl font-bold text-brand-olive">Product Variants</h4>
                      <button 
                        type="button" 
                        onClick={addVariant}
                        className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-olive transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Variant</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {newProduct.variants.map((v, idx) => (
                        <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-6 rounded-3xl relative animate-in fade-in slide-in-from-top-2">
                          <button 
                            type="button"
                            onClick={() => removeVariant(v.id)}
                            className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-500 p-2 rounded-full shadow-sm hover:shadow transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Type</label>
                            <select 
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-brand-gold outline-none transition-all"
                              value={v.type}
                              onChange={e => updateVariant(v.id, 'type', e.target.value)}
                            >
                              <option value="size">Size</option>
                              <option value="color">Color</option>
                              <option value="material">Material</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Small / Red"
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-brand-gold outline-none transition-all"
                              value={v.name}
                              onChange={e => updateVariant(v.id, 'name', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Variant Price</label>
                            <input 
                              type="number" 
                              placeholder="Optional"
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-brand-gold outline-none transition-all"
                              value={v.price || ''}
                              onChange={e => updateVariant(v.id, 'price', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Stock</label>
                            <input 
                              type="number" 
                              required
                              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-brand-gold outline-none transition-all"
                              value={v.stock}
                              onChange={e => updateVariant(v.id, 'stock', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}

                      {newProduct.variants.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                          <p className="text-sm text-gray-400 italic">No variants defined for this treasure.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all mt-4">
                  {editingId ? 'Update Masterpiece' : 'Add to Catalog'}
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
                <h3 className="font-serif text-2xl font-bold text-brand-olive">Generate Product Imagery</h3>
                <p className="text-gray-400 text-sm">Describe the masterpiece you want to visualize. Be specific about materials, lighting, and background.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">AI Visual Prompt</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm leading-relaxed"
                  placeholder="e.g. A close-up shot of an intricate 22K gold necklace with ruby accents, displayed on a minimalist marble pedestal, cinematic lighting..."
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
                  onClick={() => handleGenerateAIImage(currentAiIdx!)}
                  disabled={generatingAI !== null}
                  className="flex-1 bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2"
                >
                  {generatingAI !== null ? (
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
