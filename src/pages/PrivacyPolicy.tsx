import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, Database, Share2 } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function PrivacyPolicy() {
  return (
    <div>
      <PageBanner 
        title="Privacy Policy" 
        subtitle="How we protect your artisan experience." 
        image="https://images.unsplash.com/photo-1596752002341-2a6c1e549da7?q=80&w=2070&auto=format&fit=crop" 
      />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Eye, label: "Transparent Use" },
          { icon: Lock, label: "Secure Data" },
          { icon: Database, label: "Your Control" },
          { icon: Share2, label: "No Selling" }
        ].map((item, i) => (
          <div key={item.label} className="flex flex-col items-center p-6 bg-brand-olive/5 rounded-3xl border border-brand-olive/5">
            <item.icon className="w-6 h-6 text-brand-gold mb-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="prose prose-brand-olive max-w-none text-gray-600 space-y-10">
        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment information.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">How We Use Your Data</h2>
          <p>Your data is primarily used to process orders, improve our artisan collections, and communicate with you about your treasures. We never sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">Security Measures</h2>
          <p>We implement industry-standard AES-256 encryption and secure socket layers (SSL) to protect your sensitive information during transmission and storage.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">Cookies</h2>
          <p>We use cookies to enhance your browsing experience, remember your bag contents, and provide personalized heritage recommendations.</p>
        </section>

        <section className="bg-brand-cream/50 p-10 rounded-[2.5rem] border border-brand-olive/5">
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">Request Data Deletion</h2>
          <p className="mb-6">You have the right to request access to or deletion of your personal data at any time.</p>
          <button className="text-[10px] font-bold uppercase tracking-[0.2em] bg-brand-olive text-brand-cream px-8 py-4 rounded-full shadow-lg">
            Contact Data Protection Officer
          </button>
        </section>
      </div>
      </div>

      <ShuffledSections />
    </div>
  );
}
