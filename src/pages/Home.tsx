import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles, Award, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Antique Brass Necklace',
    price: 2499,
    category: 'Necklace',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop'],
    stock: 5,
    description: 'A beautiful antique brass necklace with semi-precious stones.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Handwoven Silk Saree',
    price: 8999,
    category: 'Handmade Sarees',
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1974&auto=format&fit=crop'],
    stock: 2,
    description: 'Exquisite handwoven Banarasi silk saree.',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Bamboo Lantern Set',
    price: 1299,
    category: 'Bamboo Home Decor',
    images: ['https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'],
    stock: 10,
    description: 'Set of two sustainable bamboo lanterns for your outdoor spaces.',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Silver Meenakari Jhumkas',
    price: 1850,
    category: 'Jewellery',
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'],
    stock: 8,
    description: 'Traditional silver jhumkas with colorful meenakari work.',
    createdAt: new Date().toISOString()
  }
];

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1561715276-a2d087060f1d?q=80&w=2070&auto=format&fit=crop"
            alt="Handcrafted Elegance"
            className="w-full h-full object-cover grayscale-[0.2]"
          />
          <div className="absolute inset-0 bg-brand-olive/20" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-brand-cream"
          >
            <h5 className="text-sm font-bold uppercase tracking-[0.4em] mb-4 text-brand-gold">
              New Collection 2026
            </h5>
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] mb-8">
              Artisan Crafted <br />
              <span className="italic font-light">Elegance</span>
            </h1>
            <p className="text-lg text-brand-cream/80 mb-10 max-w-lg leading-relaxed">
              Discover unique handcrafted treasures from across India. Every piece tells a story of tradition, patience, and unparalleled skill.
            </p>
            <Link
              to="/category/all"
              className="inline-flex items-center space-x-3 bg-brand-gold text-brand-olive px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-cream transition-colors group shadow-lg"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-brand-olive mb-4">Shop by Category</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Jewellery', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1974&auto=format&fit=crop', path: '/category/jewellery' },
            { name: 'Sarees', img: 'https://images.unsplash.com/photo-1610030469609-bc3615456484?q=80&w=2070&auto=format&fit=crop', path: '/category/handmade-sarees' },
            { name: 'Home Decor', img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=2031&auto=format&fit=crop', path: '/category/bamboo-home-decor' }
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer"
            >
              <Link to={cat.path}>
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-serif text-3xl font-bold mb-4">{cat.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-[0.4em] border-b border-white pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    View More
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Spotlight: Handmade Sarees */}
      <section className="bg-brand-olive py-24 text-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h5 className="text-xs font-bold uppercase tracking-[0.5em] text-brand-gold">Artisan Spotlight</h5>
              <h2 className="text-5xl font-serif font-bold leading-tight">The Timeless Art of Banarasi Silk</h2>
              <p className="text-brand-cream/70 leading-relaxed text-lg">
                Our handwoven sarees are crafted by master weavers using techniques passed down through generations. Each piece takes months to complete, resulting in a masterpiece of silk and zari.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Award, text: 'Authentic Handloom Certified' },
                  { icon: Sparkles, text: 'Pure Silk & Genuine Zari' },
                  { icon: Truck, text: 'Carefully Packaged Delivery' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm">
                    <item.icon className="w-5 h-5 text-brand-gold" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/category/handmade-sarees"
                className="inline-block border border-brand-cream/30 hover:border-brand-gold hover:text-brand-gold px-10 py-4 rounded-full transition-all text-xs font-bold uppercase tracking-widest"
              >
                View Collection
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1974&auto=format&fit=crop"
                  alt="Saree Crafting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 border-2 border-brand-gold/20 rounded-full animate-spin-slow" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-bold text-brand-olive">Trending Pieces</h2>
            <div className="w-16 h-1 bg-brand-gold" />
          </div>
          <Link to="/category/all" className="text-xs font-bold uppercase tracking-widest text-brand-olive hover:text-brand-gold transition-colors flex items-center space-x-2">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white border border-brand-olive/10 rounded-[3rem] py-20 shadow-sm">
        <h2 className="text-3xl font-serif font-bold text-brand-olive mb-4">Join our Artisan Community</h2>
        <p className="text-gray-500 mb-10 text-lg">Receive exclusive previews of new arrivals and artisan stories.</p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Your Email Address"
            className="flex-grow px-8 py-4 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 bg-gray-50"
          />
          <button className="bg-brand-olive text-brand-cream px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-olive/20 transition-all">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
