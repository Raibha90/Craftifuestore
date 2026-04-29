import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock, ExternalLink, Search } from 'lucide-react';
import PageBanner from '../components/PageBanner';

export default function StoreLocator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const stores = [
    {
      id: 1,
      country: "India",
      state: "Rajasthan",
      city: "Jaipur",
      name: "Heritage Flagship Store",
      address: "14, Govind Marg, Near City Palace, Jaipur, Rajasthan 302002",
      phone: "+91 141 2345 678",
      email: "jaipur@artisantreasures.in",
      hours: "10:00 AM - 08:00 PM",
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1964&auto=format&fit=crop",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14234.6!2d75.82!3d26.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6!2sCity%20Palace%2C%20Jaipur!5e0!3m2!1sen!2sin!4v1"
    },
    {
      id: 2,
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      name: "The Artisan Loft",
      address: "No. 45, Indiranagar 100 Feet Rd, Bengaluru, Karnataka 560038",
      phone: "+91 80 4321 8765",
      email: "blru@artisantreasures.in",
      hours: "11:00 AM - 09:00 PM",
      img: "https://images.unsplash.com/photo-1582037928867-67709cfd392e?q=80&w=2070&auto=format&fit=crop",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.2!2d77.63!3d12.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16!2sIndiranagar%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v2"
    },
    {
      id: 3,
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      name: "Craftsmanship Studio",
      address: "Ground Floor, Select Citywalk, Saket, New Delhi 110017",
      phone: "+91 11 9876 5432",
      email: "delhi@artisantreasures.in",
      hours: "10:30 AM - 09:30 PM",
      img: "https://images.unsplash.com/photo-1629738012675-92736e4f3a9e?q=80&w=1974&auto=format&fit=crop",
      mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.2!2d77.21!3d28.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce1!2sSelect%20CITYWALK!5e0!3m2!1sen!2sin!4v3"
    }
  ];

  const filteredStores = useMemo(() => {
    return stores.filter(s => 
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeStore = selectedStore || (filteredStores.length > 0 ? filteredStores[0] : stores[0]);

  return (
    <div>
      <PageBanner 
        title="Store Locator" 
        subtitle="Discover Our Physical Stores" 
        image="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1964&auto=format&fit=crop" 
      />
      <div className="max-w-7xl mx-auto px-4 py-20">
        
        {/* Search section */}
        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 -translate-y-1/2 left-6 text-brand-olive/50">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search by Country, State or City..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-brand-olive/10 shadow-sm rounded-full focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-sm transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/3 flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
            {filteredStores.length > 0 ? filteredStores.map((store, i) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`p-6 rounded-3xl cursor-pointer transition-all border ${activeStore.id === store.id ? 'border-brand-gold bg-brand-gold/5 shadow-md' : 'border-gray-100 bg-white hover:border-brand-olive/20 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{store.city}, {store.state}</span>
                    <h3 className="font-serif text-xl font-bold text-brand-olive mt-1">{store.name}</h3>
                  </div>
                </div>
                <div className="space-y-3 mt-4 text-sm text-gray-500">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-xs">{store.address}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <Clock className="w-4 h-4 text-brand-olive shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <Phone className="w-4 h-4 text-brand-olive shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>
                {activeStore.id !== store.id && (
                  <div className="mt-4 pt-4 border-t border-brand-olive/5 text-[10px] uppercase font-bold text-brand-olive/40 tracking-widest text-right">
                    Click to View Map
                  </div>
                )}
              </div>
            )) : (
              <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-brand-olive font-medium">No stores found for "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} className="mt-4 text-sm text-brand-gold hover:underline font-bold">Clear Search</button>
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="lg:w-2/3 h-[600px] lg:h-[800px] bg-gray-100 rounded-3xl overflow-hidden border border-brand-olive/10 shadow-lg relative">
            {activeStore ? (
              <iframe 
                src={activeStore.mapSrc} 
                className="w-full h-full border-0" 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${activeStore.name}`}
              ></iframe>
            ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <p className="text-gray-400 font-medium">Select a store to view on map</p>
               </div>
            )}
            
            {activeStore && (
               <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-brand-olive/10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img src={activeStore.img} alt={activeStore.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-serif font-bold text-brand-olive text-lg">{activeStore.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{activeStore.address}</p>
                    </div>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStore.address)}`} target="_blank" rel="noreferrer" className="shrink-0 flex items-center space-x-2 px-6 py-3 bg-brand-olive text-brand-cream rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
