import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Truck, Star, Quote, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Banner } from '../types';
import { collection, getDocs, query, limit, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const mockTestimonials = [
  {
    id: 1,
    name: "Anita Sharma",
    role: "Collector",
    review: "The brass necklace is even more beautiful in person. The craftsmanship is world-class. It's not just jewellery; it's art.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Connoisseur",
    review: "Bought the bamboo desk organizer for my office. The quality is exceptional and it adds such a warm, natural touch to my workspace.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Priya Iyer",
    role: "Home Decor Enthusiast",
    review: "The bamboo lanterns have transformed my balcony into a cozy sanctuary. sustainable, stylish, and durable!",
    rating: 4,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
  }
];

const fallbackProducts: Product[] = [
  // Jewellery
  { id: 'j1', name: 'Antique Brass Necklace', price: 2499, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop'], stock: 5, description: 'Handcrafted brass necklace', createdAt: '2026-01-01' },
  { id: 'j2', name: 'Silver Meenakari Jhumkas', price: 1850, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'], stock: 8, description: 'Traditional silver earrings', createdAt: '2026-01-02' },
  { id: 'j3', name: 'Rose Gold Floral Ring', price: 3200, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop'], stock: 3, description: 'Elegant rose gold ring', createdAt: '2026-01-03' },
  { id: 'j4', name: 'Kundan Work Bangles', price: 4500, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'Exquisite Kundan bangles', createdAt: '2026-01-04' },
  { id: 'j5', name: 'Pearl Beaded Choker', price: 2100, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop'], stock: 10, description: 'Classic pearl choker', createdAt: '2026-01-05' },
  
  // Bamboo Home Decor
  { id: 'b1', name: 'Bamboo Wall Clock', price: 1599, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=2070&auto=format&fit=crop'], stock: 6, description: 'Sustainable wall clock', createdAt: '2026-01-06' },
  { id: 'b2', name: 'Bamboo Weave Mirror', price: 2800, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1974&auto=format&fit=crop'], stock: 2, description: 'Artisan woven mirror', createdAt: '2026-01-07' },
  { id: 'b3', name: 'Bamboo Tray Set', price: 1250, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1610444319409-72c8423605e5?q=80&w=1915&auto=format&fit=crop'], stock: 15, description: 'Pair of bamboo trays', createdAt: '2026-01-08' },
  { id: 'b4', name: 'Bamboo Desk Organizer', price: 899, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1591122941067-e455952bb74e?q=80&w=1974&auto=format&fit=crop'], stock: 12, description: 'Eco-friendly organizer', createdAt: '2026-01-09' },
  { id: 'b5', name: 'Bamboo Partition Screen', price: 7500, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=2070&auto=format&fit=crop'], stock: 1, description: 'Handcrafted room divider', createdAt: '2026-01-10' },

  // Lamps & Lighting
  { id: 'l1', name: 'Modern Bamboo Lamp', price: 3499, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'], stock: 10, description: 'Eco-modern table lamp', createdAt: '2026-01-11' },
  { id: 'l2', name: 'Bamboo Pendant Light', price: 2600, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop'], stock: 7, description: 'Woven ceiling lamp', createdAt: '2026-01-12' },
  { id: 'l3', name: 'Decorative Lantern', price: 1800, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1974&auto=format&fit=crop'], stock: 9, description: 'Geometric bamboo lantern', createdAt: '2026-01-13' },
  { id: 'l4', name: 'Terracotta Night Lamp', price: 1450, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'Earthy bedside lamp', createdAt: '2026-01-14' },
  { id: 'l5', name: 'Crystal Bedside Lamp', price: 2200, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1974&auto=format&fit=crop'], stock: 11, description: 'Refined accent lighting', createdAt: '2026-01-15' },
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'banners'), orderBy('order', 'asc')), (snap) => {
      const fetchedBanners = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)).filter(b => b.active !== false);
      setBanners(fetchedBanners);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % mockTestimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const [bannerIndex, setBannerIndex] = useState(0);
  const [cmsHome, setCmsHome] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cms', 'home'), (docSnap) => {
      if (docSnap.exists()) {
        setCmsHome(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'cms/home');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % banners.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const activeBanner = banners[bannerIndex] || {
    title: 'Artisan Crafted Elegance',
    subtitle: 'Discover unique handcrafted treasures from across India. Every piece tells a story of tradition, patience, and unparalleled skill.',
    imageUrl: 'https://images.unsplash.com/photo-1561715276-a2d087060f1d?q=80&w=2070&auto=format&fit=crop',
    link: '/category/all'
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="w-full h-full object-cover grayscale-[0.1]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-olive/20" />
          </motion.div>
        </AnimatePresence>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl text-brand-cream"
            >
              <h5 className="text-sm font-bold uppercase tracking-[0.4em] mb-4 text-brand-gold">
                New Collection 2026
              </h5>
              <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] mb-8">
                {activeBanner.title.split(' ').slice(0, -1).join(' ')} <br />
                <span className="italic font-light">{activeBanner.title.split(' ').slice(-1)}</span>
              </h1>
              <p className="text-lg text-brand-cream/80 mb-10 max-w-lg leading-relaxed">
                {activeBanner.subtitle}
              </p>
              <Link
                to={activeBanner.link || '/category/all'}
                className="inline-flex items-center space-x-3 bg-brand-gold text-brand-olive px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-cream transition-colors group shadow-lg"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel indicators if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
             {banners.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setBannerIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === bannerIndex ? 'bg-brand-gold w-8' : 'bg-white/50'}`}
                />
             ))}
          </div>
        )}
      </section>

      {/* Process Section - MOVED TO TOP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-brand-olive mb-4">The Crafting Process</h2>
          <p className="text-gray-500 max-w-xl mx-auto italic">How we bring traditional Indian artistry to your doorstep, step by meticulously handcrafted step.</p>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Ethical Sourcing",
              desc: "We handpick sustainable bamboo and pure brass directly from rural artisan clusters who share our ethics.",
              img: "https://images.unsplash.com/photo-1591122941067-e455952bb74e?q=80&w=1974&auto=format&fit=crop"
            },
            {
              title: "Master Weaving",
              desc: "Skilled artisans spend days weaving intricate patterns using age-old traditional techniques passed down generations.",
              img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=2031&auto=format&fit=crop"
            },
            {
              title: "Natural Finishing",
              desc: "Each piece is polished using natural plant-based oils and non-toxic finishes for a healthy, timeless glow.",
              img: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1974&auto=format&fit=crop"
            },
            {
              title: "Quality Check",
              desc: "Every treasure undergoes a rigorous quality check to ensure it meets our heritage standards before shipping.",
              img: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop"
            }
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-brand-olive/5 group"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={step.img} 
                  alt={step.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <span className="text-3xl font-extra-light text-brand-gold/30 mb-4 block">0{i + 1}</span>
                <h4 className="text-xl font-serif font-bold text-brand-olive mb-3">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-brand-olive mb-4">Explore Our World</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Handcrafted categories tailored for your lifestyle</p>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Jewellery', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1974&auto=format&fit=crop', path: '/category/jewellery', count: '5+ Items' },
            { name: 'Bamboo Home Decor', img: 'https://artifact.googleusercontent.com/main/T15099395277800000000/02_bamboo_wall_hanging.jpg', path: '/category/bamboo-home-decor', count: '5+ Items' },
            { name: 'Lamps & Lighting', img: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop', path: '/category/lamps-lighting', count: '5+ Items' }
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[30rem] rounded-[3rem] overflow-hidden cursor-pointer shadow-lg"
            >
              <Link to={cat.path}>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-olive/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-end text-white pb-12">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-gold mb-2 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">{cat.count}</span>
                  <h3 className="font-serif text-3xl font-bold mb-4">{cat.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-[0.4em] border-b border-white pb-2 transition-all">
                    View Treasures
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signature Pieces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-serif font-bold text-brand-olive">Signature Treasures</h2>
            <p className="text-gray-500 italic">One exquisite piece from each of our core heritage collections.</p>
          </div>
          <div className="flex space-x-4">
            <div className="w-12 h-[1px] bg-brand-gold mt-3 md:block hidden" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Curated for 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { cat: 'Jewellery', id: 'j1' },
            { cat: 'Bamboo Home Decor', id: 'b2' },
            { cat: 'Lamps & Lighting', id: 'l1' }
          ].map((feat) => {
            const product = fallbackProducts.find(p => p.id === feat.id);
            if (!product) return null;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden mb-6 shadow-md group-hover:shadow-2xl transition-all duration-500">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-olive">{feat.cat}</span>
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <h4 className="font-serif text-xl font-bold text-brand-olive mb-2 group-hover:text-brand-gold transition-colors">{product.name}</h4>
                    <p className="text-brand-gold font-bold">₹{product.price}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Spotlight: Artisan values */}
      <section className="bg-brand-olive py-24 text-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h5 className="text-xs font-bold uppercase tracking-[0.5em] text-brand-gold">Our Philosophy</h5>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                {cmsHome?.philosophyHeading || 'Craftsmanship with Conscious Soul'}
              </h2>
              <p className="text-brand-cream/70 leading-relaxed text-lg">
                {cmsHome?.philosophyContent || 'Craftifue is dedicated to bringing you the finest handmade treasures from across India. Every product in our collection is a testament to the skill of our artisans and our commitment to sustainable luxury.'}
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Award, text: 'Artisan Authenticity Guaranteed' },
                  { icon: Sparkles, text: 'Sustainable & Natural Materials' },
                  { icon: Truck, text: 'Crafted with Love, Delivered with Care' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm">
                    <item.icon className="w-5 h-5 text-brand-gold" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/about/craftifue"
                className="inline-block border border-brand-cream/30 hover:border-brand-gold hover:text-brand-gold px-10 py-4 rounded-full transition-all text-xs font-bold uppercase tracking-widest"
              >
                Learn More
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src={cmsHome?.philosophyImage || "https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop"}
                  alt="Philosophy spotlight"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
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
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
               <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
               <p className="text-brand-olive font-serif italic">Curating your collection...</p>
             </div>
          ) : (
            products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-brand-cream/50 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-gold">Kind Words</h5>
            <h2 className="text-4xl font-serif font-bold text-brand-olive">Customer Experiences</h2>
            <div className="w-16 h-1 bg-brand-gold mx-auto" />
          </div>

          <div className="relative max-w-4xl mx-auto h-[450px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-brand-olive/5 shadow-xl relative group w-full max-w-3xl">
                  <div className="absolute -top-6 left-10 w-12 h-12 bg-brand-gold text-brand-cream rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                    <Quote className="w-6 h-6" />
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-8">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`w-5 h-5 ${idx < mockTestimonials[activeIndex].rating ? 'text-brand-gold fill-current' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 italic leading-relaxed mb-10 text-xl md:text-2xl font-serif">
                    "{mockTestimonials[activeIndex].review}"
                  </p>

                  <div className="flex items-center space-x-4 border-t border-gray-50 pt-8">
                    <img 
                      src={mockTestimonials[activeIndex].image} 
                      alt={mockTestimonials[activeIndex].name} 
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-brand-gold/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-brand-olive text-lg">{mockTestimonials[activeIndex].name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{mockTestimonials[activeIndex].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
              {mockTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > activeIndex ? 1 : -1);
                    setActiveIndex(i);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-olive w-8' : 'bg-gray-300 hover:bg-brand-gold'}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="hidden md:block">
              <button
                onClick={prevTestimonial}
                className="absolute left-[-5rem] top-1/2 -translate-y-1/2 p-4 rounded-full border border-brand-olive/10 text-brand-olive hover:bg-brand-olive hover:text-brand-cream transition-all shadow-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-[-5rem] top-1/2 -translate-y-1/2 p-4 rounded-full border border-brand-olive/10 text-brand-olive hover:bg-brand-olive hover:text-brand-cream transition-all shadow-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
