import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function TermsConditions() {
  const [data, setData] = useState({ title: '', content: '' });

  useEffect(() => {
    getDoc(doc(db, 'cms', 'terms')).then(docSnap => {
      if (docSnap.exists()) {
        setData(docSnap.data() as any);
      }
    });
  }, []);

  return (
    <div>
      <PageBanner 
        title={data.title || "Terms & Conditions"} 
        subtitle="The foundation of our artisan journey together." 
        image="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop" 
      />
      <div className="max-w-4xl mx-auto px-4 py-20 pb-40">
        <div className="prose prose-brand-olive max-w-none text-gray-600 space-y-12 whitespace-pre-wrap">
          {data.content}
        </div>
      </div>
      <ShuffledSections />
    </div>
  );
}
