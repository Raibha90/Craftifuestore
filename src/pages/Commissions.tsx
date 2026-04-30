import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Percent, 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  Target, 
  Briefcase, 
  CircleDollarSign, 
  Handshake, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface CommissionCMS {
  title: string;
  subtitle: string;
  bannerImage: string;
  content: string;
}

export default function Commissions() {
  const [content, setContent] = useState<CommissionCMS | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'commission_info'), (snap) => {
      if (snap.exists()) {
        setContent(snap.data() as CommissionCMS);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="w-8 h-8 border-2 border-brand-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src={content?.bannerImage || "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=2070&auto=format&fit=crop"} 
          alt="Commissions" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-olive/40 backdrop-blur-[2px]" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="text-white/60 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Platform Policy</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white uppercase italic leading-tight">
              {content?.title || "Artisan Commission Structure"}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              {content?.subtitle || "Transparent and fair heritage-focused partnership models designed to empower regional craftsmanship."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-4xl font-serif font-bold text-brand-olive uppercase tracking-tight">Fairness as a <span className="text-brand-gold italic">Standard</span></h2>
                <div className="h-1.5 w-24 bg-brand-gold rounded-full" />
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  {content?.content || "At Craftifue, our commission model is more than a fee—it is an investment in the long-term survival of Indian heritage. We prioritize artisan take-home pay while maintaining a sustainable ecosystem."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Zero Listing Fees', desc: 'Starting your journey with us costs nothing. We only succeed when you sell.', icon: Wallet },
                  { title: 'Secured Payouts', desc: 'Bi-weekly settlement cycles directly to your registered bank account.', icon: ShieldCheck },
                  { title: 'Growth Support', desc: 'Access to data insights and professional photography services to boost sales.', icon: TrendingUp },
                  { title: 'Global Logistics', desc: 'We handle shipping complexities so you can focus on your craftsmanship.', icon: Briefcase }
                ].map((item, i) => (
                  <div key={i} className="space-y-3 p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-brand-gold" />
                    </div>
                    <h4 className="font-bold text-brand-olive uppercase tracking-wider text-xs">{item.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-brand-olive p-12 rounded-[4rem] text-brand-cream space-y-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center space-x-4">
                    <CircleDollarSign className="w-10 h-10 text-brand-gold" />
                    <h3 className="text-2xl font-serif font-bold italic">Standard Model</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end pb-4 border-b border-white/10">
                      <span className="text-sm font-bold uppercase tracking-widest text-brand-gold">Commission Rate</span>
                      <span className="text-5xl font-serif font-bold italic leading-none">12-18%</span>
                    </div>
                    
                    <ul className="space-y-4">
                      {[
                        'Transparent deduction on product value',
                        'Includes platform listing & digital marketing',
                        'Customer service & dispute handling',
                        'Packaging support for fragile items'
                      ].map((li, i) => (
                        <li key={i} className="flex items-center space-x-3 text-sm opacity-80">
                          <div className="w-1 h-1 bg-brand-gold rounded-full" />
                          <span>{li}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    to="/vendor-registration"
                    className="w-full bg-brand-gold text-brand-olive py-5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition-transform"
                  >
                    <span>Partner with us</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Float badge */}
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 max-w-[200px] hidden md:block">
                 <Sparkles className="w-10 h-10 text-brand-gold mb-4" />
                 <p className="text-[10px] font-bold text-brand-olive uppercase tracking-[0.2em] mb-2">Artisan First</p>
                 <p className="text-xs text-gray-400 italic font-serif">"Our commission covers the tech, so you can keep the soul."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="bg-brand-olive py-32 text-center text-brand-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-10">
          <Handshake className="w-16 h-16 text-brand-gold mx-auto opacity-40" />
          <h3 className="text-4xl md:text-5xl font-serif italic leading-tight">
            "Transparency is the foundation of every heritage handshake."
          </h3>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-[1px] bg-brand-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-gold">Craftifue Ethics Code</span>
            <div className="w-12 h-[1px] bg-brand-gold" />
          </div>
        </div>
      </section>
    </div>
  );
}
