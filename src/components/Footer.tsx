import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Footer({ id }: { id: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [appearance, setAppearance] = useState<any>(null);

  // Real-time settings listeners
  useEffect(() => {
    const unsubGen = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setLogoUrl(doc.data().logoUrl || null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });

    const unsubApp = onSnapshot(doc(db, 'settings', 'appearance'), (doc) => {
      if (doc.exists()) {
        setAppearance(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/appearance');
    });

    return () => {
      unsubGen();
      unsubApp();
    };
  }, []);

  const aboutText = appearance?.footerAbout || "Celebrating traditional craftsmanship with modern elegance. Each piece is handcrafted by artisans with love and care.";
  const address = appearance?.storeAddress || "123 Artisan Way, Jaipur, India";
  const whatsapp = appearance?.whatsapp || "+91 98765 43210";
  const email = appearance?.email || "hello@handcrafted.com";
  const instagram = appearance?.instagram || "#";
  const facebook = appearance?.facebook || "#";

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
            <p className="text-sm text-brand-cream/70 leading-relaxed max-w-xs italic">
              {aboutText}
            </p>
            {appearance?.showSocial !== false && (
              <div className="flex space-x-4">
                <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`} className="hover:text-brand-gold transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} className="hover:text-brand-gold transition-colors"><Facebook className="w-5 h-5" /></a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6">Information</h4>
            <ul className="space-y-4 text-sm text-brand-cream/70">
              <li><Link to="/about/craftifue" className="hover:text-brand-gold transition-colors">Our Story</Link></li>
              <li><Link to="/stores" className="hover:text-brand-gold transition-colors">Store Locator</Link></li>
              <li><Link to="/returns" className="hover:text-brand-gold transition-colors">Return Policy</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-gold transition-colors">Track Order</Link></li>
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
                <span>{address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>{whatsapp}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-brand-gold" />
                <span>{email}</span>
              </li>
            </ul>

            {/* Compact Developer Credits */}
            {(appearance?.developerName || appearance?.developerImage) && (
              <div className="mt-8 pt-6 border-t border-brand-cream/10">
                <div className="flex items-center space-x-3 opacity-60 hover:opacity-100 transition-opacity group">
                  {appearance?.developerImage && (
                    <img 
                      src={appearance.developerImage} 
                      alt={appearance.developerName || "Developer"} 
                      className="w-8 h-8 rounded-full object-cover border border-brand-gold/30 group-hover:border-brand-gold transition-colors"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="text-left">
                    <p className="text-[9px] text-brand-cream/40 uppercase tracking-widest font-bold">Developed by</p>
                    <p className="text-xs font-serif font-bold text-brand-gold">{appearance?.developerName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-0 text-[10px] uppercase tracking-widest text-brand-cream/40">
            <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-2 md:space-y-0">
              <p>{appearance?.copyrightText || "© 2026 Craftifue Heritage. All rights reserved."}</p>
              <div className="flex space-x-4">
                <Link to="/privacy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-brand-gold transition-colors">Terms & Conditions</Link>
                <Link to="/refund-policy" className="hover:text-brand-gold transition-colors">Refund Policy</Link>
              </div>
            </div>
            {appearance?.showPaymentLogos !== false && (
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
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
