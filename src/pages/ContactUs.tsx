import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../components/Toast';
import PageBanner from '../components/PageBanner';

export default function ContactUs() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [cms, setCms] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setCms(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'contact_inquiries'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new',
        type: 'bulk_enquiry'
      });

      showToast('Thank you! Your bulk enquiry has been received. Our concierge will contact you shortly.', 'success');
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      console.error(error);
      showToast('Failed to send enquiry. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = {
    address: cms?.address || "1B3-2E, Sanhita Simoco Township Project, Satulia, Kashipur, Near Hatishala Six Lane, Newtown, Kolkata-700135",
    phone: cms?.phone || "+91 93301 23456",
    email: cms?.email || "bulk@craftifue.store"
  };

  return (
    <div className="bg-brand-cream/30 min-h-screen">
      <PageBanner 
        title={cms?.title || "Artisan Concierge"} 
        subtitle={cms?.subtitle || "Partner with us for heritage-focused bulk orders and professional consultations."}
        image={cms?.bannerImage || "https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop"}
      />

      <div className="w-full flex flex-col lg:flex-row min-h-[70vh]">
        {/* Left Side: Form (50%) */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 bg-white flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto lg:ml-auto w-full"
          >
            <div className="mb-12">
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-gold bg-brand-gold/10 px-4 py-2 rounded-full inline-block mb-6">
                Corporate & Bulk
              </span>
              <h2 className="text-4xl font-serif font-bold text-brand-olive mb-4">Bulk Order Enquiry</h2>
              <p className="text-gray-500 leading-relaxed">
                Whether you are looking for corporate gifting, hotel decor, or wholesale pricing, our artisan team is ready to assist you in curating the perfect heritage collection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Your Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Official Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Company / Organization</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all text-sm"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Bulk Requirements</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-gold outline-none transition-all resize-none text-sm"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us about the quantity, timeline and products you are interested in."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-olive text-brand-cream py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-olive/10 hover:shadow-brand-olive/30 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                <span>{loading ? 'Processing...' : 'Submit Concierge Request'}</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Side: Address & Map (50%) */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Info Card */}
          <div className="bg-brand-olive p-12 md:p-20 text-brand-cream flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto lg:mr-auto w-full space-y-12"
            >
              <div>
                <h3 className="text-3xl font-serif font-bold mb-8">Reach Out</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                      <MapPin className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold mb-2">For Pickup / Consultation</p>
                      <p className="text-sm font-serif italic opacity-90 leading-relaxed max-w-sm">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <Mail className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold mb-1">Email</p>
                        <p className="text-sm font-bold">{contactInfo.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <Phone className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold mb-1">Inquiry Hotline</p>
                        <p className="text-sm font-bold">{contactInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                      <Clock className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold mb-1">Hours</p>
                      <p className="text-sm font-bold">Mon - Sat: 10:00 AM - 07:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <div className="flex-grow min-h-[400px] grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.992644265492!2d88.498801!3d22.579308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02750e3e3e3e3e%3A0xc3b83b3e3e3e3e3e!2sSanhita%20Simoco%20Township!5e0!3m2!1sen!2sin!4v1714440000000!5m2!1sen!2sin"
              className="w-full h-full border-0" 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
