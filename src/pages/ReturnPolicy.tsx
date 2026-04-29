import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, ShieldCheck, Clock, Truck } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function ReturnPolicy() {
  return (
    <div>
      <PageBanner 
        title="Return & Exchange Policy" 
        subtitle="Hassle-Free Returns" 
        image="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1974&auto=format&fit=crop" 
      />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[
          { icon: Clock, title: "7-Day Return Window", desc: "You have 7 working days from the date of delivery to request a return or exchange." },
          { icon: RefreshCcw, title: "Easy Replacements", desc: "If you receive a damaged item, we will replace it free of cost within 3-5 working days." },
          { icon: ShieldCheck, title: "Quality Guaranteed", desc: "We ensure every piece meets our heritage standards before it leaves our artisan clusters." },
          { icon: Truck, title: "Reverse Pickup", desc: "We arrange for reverse pickups in most pin codes for your convenience." }
        ].map((item, i) => (
          <div key={item.title} className="bg-white p-8 rounded-[2.5rem] border border-brand-olive/5 shadow-sm">
            <item.icon className="w-8 h-8 text-brand-gold mb-4" />
            <h3 className="font-serif text-xl font-bold text-brand-olive mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="prose prose-brand-olive max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive">1. Conditions for Return</h2>
          <p>The product must be unused, unwashed, and in the same condition that you received it. It must also be in the original packaging with all tags intact.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive">2. Non-Returnable Items</h2>
          <p>Items on clearance sale, customized jewellery, and personalized home decor items are not eligible for returns unless they arrive damaged.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive">3. Refund Process</h2>
          <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. After approval, your refund will be processed to the original method of payment within 7-10 business days.</p>
        </section>

        <section className="bg-brand-olive/5 p-8 rounded-[2rem] border border-brand-olive/10">
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">Need Help?</h2>
          <p className="mb-4">Contact our support team for any queries regarding returns and refunds.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <p className="text-sm font-bold text-brand-olive">Email: returns@artisantreasures.in</p>
            <p className="text-sm font-bold text-brand-olive">Phone: +91 1800-ARTISAN</p>
          </div>
        </section>
      </div>
      </div>

      <ShuffledSections />
    </div>
  );
}
