import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import ShuffledSections from '../components/ShuffledSections';

export default function StoreLocator() {
  const stores = [
    {
      city: "Jaipur",
      name: "Heritage Flagship Store",
      address: "14, Govind Marg, Near City Palace, Jaipur, Rajasthan 302002",
      phone: "+91 141 2345 678",
      email: "jaipur@artisantreasures.in",
      hours: "10:00 AM - 08:00 PM",
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1964&auto=format&fit=crop"
    },
    {
      city: "Bengaluru",
      name: "The Artisan Loft",
      address: "No. 45, Indiranagar 100 Feet Rd, Bengaluru, Karnataka 560038",
      phone: "+91 80 4321 8765",
      email: "blru@artisantreasures.in",
      hours: "11:00 AM - 09:00 PM",
      img: "https://images.unsplash.com/photo-1582037928867-67709cfd392e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      city: "New Delhi",
      name: "Craftsmanship Studio",
      address: "Ground Floor, Select Citywalk, Saket, New Delhi 110017",
      phone: "+91 11 9876 5432",
      email: "delhi@artisantreasures.in",
      hours: "10:30 AM - 09:30 PM",
      img: "https://images.unsplash.com/photo-1629738012675-92736e4f3a9e?q=80&w=1974&auto=format&fit=crop"
    }
  ];

  return (
    <div>
      <PageBanner 
        title="Store Locator" 
        subtitle="Discover Our Physical Stores" 
        image="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1964&auto=format&fit=crop" 
      />
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {stores.map((store, i) => (
          <motion.div
            key={store.city}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative h-[25rem] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
              <img 
                src={store.img} 
                alt={store.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-olive/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-brand-olive/5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">{store.city}</span>
              </div>
            </div>

            <div className="px-2 space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-brand-olive group-hover:text-brand-gold transition-colors">{store.name}</h3>
                <div className="flex items-start space-x-3 mt-4 text-gray-500">
                  <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-1" />
                  <p className="text-sm leading-relaxed">{store.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-brand-olive/5">
                <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Clock className="w-4 h-4 text-brand-gold" />
                  <span>{store.hours}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <span>{store.phone}</span>
                </div>
              </div>

              <button className="w-full mt-4 flex items-center justify-center space-x-2 py-4 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white transition-all rounded-full text-[10px] font-bold uppercase tracking-widest">
                <span>View on Maps</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Artisan Pop-up Section */}
      <section className="mt-32 bg-brand-olive rounded-[3rem] p-12 md:p-20 text-brand-cream relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6 italic">Can't make it to our stores?</h2>
            <p className="text-brand-cream/70 text-lg leading-relaxed mb-10">
              We bring the stores to you. Book a virtual live tour of our workshop and treasures with one of our master curators.
            </p>
            <button className="bg-brand-gold text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform">
              Book a Virtual Tour
            </button>
          </div>
          <div className="hidden lg:block relative h-80">
            <img 
              src="https://images.unsplash.com/photo-1591122941067-e455952bb74e?q=80&w=1974&auto=format&fit=crop" 
              className="w-full h-full object-cover rounded-3xl"
              alt="Artisan at work"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
      </div>

      <ShuffledSections />
    </div>
  );
}
