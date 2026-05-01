import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { fallbackProducts } from '../lib/fallbackData';

export default function RelatedProducts({ category, currentProductId }: { category: string; currentProductId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', category),
          limit(5)
        );
        const snapshot = await getDocs(q);
        let fetched = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as Product));
        
        if (fetched.length === 0) {
           fetched = fallbackProducts.filter(p => p.category === category);
        }

        fetched = fetched.filter(p => p.id !== currentProductId) // manually filter to avoid needing an inequality index
          .slice(0, 4);

        setProducts(fetched);
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };
    if (category) {
       fetchRelated();
    }
  }, [category, currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-32">
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-olive mb-6">Complete the Look</h2>
        <div className="w-24 h-1 bg-brand-gold rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
