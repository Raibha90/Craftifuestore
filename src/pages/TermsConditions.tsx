import React from 'react';
import { motion } from 'motion/react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function TermsConditions() {
  return (
    <div>
      <PageBanner 
        title="Terms & Conditions" 
        subtitle="The foundation of our artisan journey together." 
        image="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop" 
      />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="prose prose-brand-olive max-w-none text-gray-600 space-y-12">
        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">1. Agreement to Terms</h2>
          <p>By accessing or using Artisan Treasures, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">2. Handmade Nature Disclosure</h2>
          <p>Since our products are handcrafted by traditional artisans, minor variations in color, texture, and size are expected and celebrated as marks of authenticity. Such variations are not considered defects.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">3. Pricing & Payments</h2>
          <p>All prices are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">4. Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, and images, is the property of Artisan Treasures and is protected by international copyright laws.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-brand-olive mb-4">5. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        </section>

        <section className="text-xs text-gray-400 font-medium uppercase tracking-[0.2em] pt-12">
          Last Updated: April 28, 2026
        </section>
      </div>
      </div>

      <ShuffledSections />
    </div>
  );
}
