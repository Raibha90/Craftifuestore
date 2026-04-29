import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function ReturnPolicy() {
  const [data, setData] = useState({ title: '', content: '' });

  useEffect(() => {
    getDoc(doc(db, 'cms', 'return_policy')).then(docSnap => {
      if (docSnap.exists()) {
        setData(docSnap.data() as any);
      }
    });
  }, []);

  return (
    <div>
      <PageBanner 
        title={data.title || "Return & Exchange Policy"} 
        subtitle="Hassle-Free Returns" 
        image="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1974&auto=format&fit=crop" 
      />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="prose prose-brand-olive max-w-none text-gray-600 space-y-8 whitespace-pre-wrap">
          {data.content}
        </div>
      </div>
      <ShuffledSections />
    </div>
  );
}
