import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Footer({ id }: { id: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Real-time logo listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setLogoUrl(doc.data().logoUrl || null);
      }
    });
    return () => unsub();
  }, []);

  return (
    <footer id={id} className="bg-brand-olive text-brand-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center">
              <img 
                src={logoUrl || "/regenerated_image_1777410191797.png"} 
                alt="Craftifue Logo" 
                className="h-16 w-auto brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            </Link>
            <p className="text-sm text-brand-cream/70 leading-relaxed max-w-xs">
              Celebrating traditional craftsmanship with modern elegance. Each piece is handcrafted by artisans with love and care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-gold transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-gold transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-brand-cream/70">
              <li><Link to="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
              <li><Link to="/category/necklace" className="hover:text-brand-gold transition-colors">Jewellery</Link></li>
              <li><Link to="/category/home-decor" className="hover:text-brand-gold transition-colors">Home Decor</Link></li>
              <li><Link to="/about/craftifue" className="hover:text-brand-gold transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Collections</h4>
            <ul className="space-y-4 text-sm text-brand-cream/70">
              <li><Link to="/category/bamboo-home-decor" className="hover:text-brand-gold transition-colors">Bamboo Home Decor</Link></li>
              <li><Link to="/category/necklace" className="hover:text-brand-gold transition-colors">Necklaces</Link></li>
              <li><Link to="/category/bangles" className="hover:text-brand-gold transition-colors">Bangles</Link></li>
              <li><Link to="/category/rings" className="hover:text-brand-gold transition-colors">Rings</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-brand-cream/70">
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>123 Artisan Way, Jaipur, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-brand-gold" />
                <span>hello@handcrafted.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] uppercase tracking-widest text-brand-cream/40">
          <p>© 2026 Handcrafted Home & Jewellery. All rights reserved.</p>
          <div className="flex items-center space-x-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <img 
              src="https://raw.githubusercontent.com/creative-fullstack/payment-logos/main/visa.png" 
              alt="Visa" 
              className="h-4" 
              referrerPolicy="no-referrer"
            />
            <img 
              src="https://raw.githubusercontent.com/creative-fullstack/payment-logos/main/mastercard.png" 
              alt="Mastercard" 
              className="h-6" 
              referrerPolicy="no-referrer"
            />
            <img 
              src="https://raw.githubusercontent.com/creative-fullstack/payment-logos/main/rupay.png" 
              alt="RuPay" 
              className="h-4" 
              referrerPolicy="no-referrer"
            />
            <img 
              src="https://raw.githubusercontent.com/creative-fullstack/payment-logos/main/upi.png" 
              alt="UPI" 
              className="h-6" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
