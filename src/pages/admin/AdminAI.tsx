import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Wand2, Save, Loader2, Sparkles, TrendingUp, BarChart2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

interface AIConfig {
  id?: string;
  promptContext: string;
  formFieldsVisibility: {
    occasion: boolean;
    style: boolean;
    budget: boolean;
    color: boolean;
    roomOutfit: boolean;
  };
  weights: {
    priceImportance: number;
    styleImportance: number;
  };
}

export default function AdminAI() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const snap = await getDocs(collection(db, 'aiConfig'));
      if (!snap.empty) {
        setConfig({
          id: snap.docs[0].id,
          ...snap.docs[0].data()
        } as AIConfig);
      } else {
        setConfig({
          promptContext: "You are an AI personal shopper. Recommend exactly 5 products from the list.",
          formFieldsVisibility: { occasion: true, style: true, budget: true, color: true, roomOutfit: true },
          weights: { priceImportance: 5, styleImportance: 8 }
        });
      }
    } catch (e) {
      console.error('Failed to load AI config', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      if (config.id) {
        await updateDoc(doc(db, 'aiConfig', config.id), config as any);
      } else {
        const docRef = doc(collection(db, 'aiConfig'));
        await setDoc(docRef, config as any);
        setConfig({ ...config, id: docRef.id });
      }
      showToast('AI Configuration saved successfully!', 'success');
    } catch (e) {
      console.error('Failed to save AI config', e);
      showToast('Failed to save configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-brand-olive animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brand-olive flex items-center space-x-3">
          <Wand2 className="w-8 h-8 text-brand-gold" />
          <span>AI Personalizer Engine</span>
        </h1>
        <p className="text-gray-500 mt-2">Manage prompts, form fields, weights, and analytics for the AI Personal Shopper.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-olive/5 space-y-6">
            <h2 className="text-xl font-serif font-bold text-brand-olive flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <span>Prompt Configuration</span>
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-brand-olive">System Context prompt</label>
              <textarea 
                rows={6}
                value={config?.promptContext}
                onChange={(e) => setConfig({ ...config!, promptContext: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-brand-olive/10 rounded-xl focus:border-brand-gold focus:ring-brand-gold"
                placeholder="Instruct the AI on how to recommend products..."
              />
              <p className="text-xs text-gray-500">This prompt controls how the Gemini model interprets the product catalog and user inputs.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-olive/5 space-y-6">
            <h2 className="text-xl font-serif font-bold text-brand-olive flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-brand-gold" />
              <span>Recommendation Weights</span>
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-brand-olive">Price Importance ({config?.weights.priceImportance || 5}/10)</label>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={config?.weights.priceImportance || 5}
                  onChange={(e) => setConfig({ ...config!, weights: { ...config!.weights, priceImportance: parseInt(e.target.value) }})}
                  className="w-full accent-brand-gold"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-brand-olive">Style Importance ({config?.weights.styleImportance || 8}/10)</label>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={config?.weights.styleImportance || 8}
                  onChange={(e) => setConfig({ ...config!, weights: { ...config!.weights, styleImportance: parseInt(e.target.value) }})}
                  className="w-full accent-brand-gold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-brand-olive text-brand-cream px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-olive/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Save AI Config</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-olive to-brand-olive/90 text-brand-cream p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-xl font-serif font-bold flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-brand-gold" />
                <span>AI Analytics</span>
              </h2>
              <div className="space-y-4">
                <div className="bg-brand-cream/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-brand-gold uppercase tracking-widest font-bold">Total AI Impressions</p>
                  <p className="text-3xl font-serif font-bold mt-1">1,248</p>
                </div>
                <div className="bg-brand-cream/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-brand-gold uppercase tracking-widest font-bold">Suggestions Clicked</p>
                  <p className="text-3xl font-serif font-bold mt-1">456</p>
                </div>
                <div className="bg-brand-cream/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-brand-gold uppercase tracking-widest font-bold">Conversions via AI</p>
                  <p className="text-3xl font-serif font-bold mt-1">89</p>
                </div>
              </div>
              <div className="pt-4 border-t border-brand-cream/20">
                <p className="text-sm font-bold uppercase tracking-widest mb-3">Trending AI Queries</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-brand-cream/10 rounded-full">Boho Summer Dress</span>
                  <span className="px-3 py-1 bg-brand-cream/10 rounded-full">Minimalist Gold</span>
                  <span className="px-3 py-1 bg-brand-cream/10 rounded-full">Wedding Gift under $50</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
