import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'contact_inquiries'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      // 2. Send Email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'contact@craftifue.store', // Admin email, change if needed
          subject: `New Bulk Order Enquiry from ${formData.name}`,
          html: `
            <h3>New Bulk Order Enquiry</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Company:</strong> ${formData.company}</p>
            <p><strong>Message:</strong> ${formData.message}</p>
          `
        })
      });

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setTimeout(() => setSuccess(false), 5000); // Hide toast after 5 seconds
    } catch (error) {
      console.error(error);
      alert('Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-olive mb-4">Contact Us & Bulk Enquiries</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Looking to place a bulk order or have specific requirements? Get in touch with our team of artisan experts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8 bg-brand-olive/5 p-10 rounded-3xl border border-brand-olive/10 h-max">
          <div>
            <h3 className="font-serif text-2xl font-bold text-brand-olive mb-6">Get in Touch</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-brand-olive">Headquarters</p>
                  <p className="text-gray-500 text-sm mt-1">123 Artisan Way,<br/>Craft District, Jaipur 302001<br/>India</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-brand-olive">Email Us</p>
                  <p className="text-gray-500 text-sm mt-1">contact@craftifue.store</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-brand-olive">Call Us</p>
                  <p className="text-gray-500 text-sm mt-1">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-10 shadow-sm relative overflow-hidden">
          <h3 className="font-serif text-2xl font-bold text-brand-olive mb-8">Bulk Enquiry Form</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Company Name (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Message / Requirements</label>
              <textarea 
                required
                rows={5}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Please describe your bulk order requirements or any questions you have."
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>{loading ? 'Sending...' : 'Send Enquiry'}</span>
            </button>
          </form>

          {/* Toast Notification */}
          {success && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-10 left-10 right-10 flex items-center p-4 space-x-3 bg-green-100 text-green-700 rounded-2xl border border-green-200"
             >
                <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-green-200 rounded-full">✓</div>
                <p className="text-sm font-medium">Thank you! Your enquiry has been sent. We will get back to you shortly.</p>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
