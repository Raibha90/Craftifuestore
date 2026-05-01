import { Product } from '../types';

export const fallbackProducts: Product[] = [
  // Jewellery
  { id: 'j1', name: 'Antique Brass Necklace', price: 2499, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop'], stock: 5, description: 'Handcrafted brass necklace combining traditional aesthetics with modern elegance.', createdAt: '2026-01-01' },
  { id: 'j2', name: 'Silver Meenakari Jhumkas', price: 1850, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'], stock: 8, description: 'Traditional silver earrings featuring intricate Meenakari work.', createdAt: '2026-01-02' },
  { id: 'j3', name: 'Rose Gold Floral Ring', price: 3200, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop'], stock: 3, description: 'Elegant rose gold ring with a delicate floral design.', createdAt: '2026-01-03' },
  { id: 'j4', name: 'Kundan Work Bangles', price: 4500, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'Exquisite bangles adorned with traditional Kundan stones.', createdAt: '2026-01-04' },
  { id: 'j5', name: 'Pearl Beaded Choker', price: 2100, category: 'Jewellery', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop'], stock: 10, description: 'A classic choker beautifully strung with lustrous pearls.', createdAt: '2026-01-05' },
  
  // Bamboo Home Decor
  { id: 'b1', name: 'Bamboo Wall Clock', price: 1599, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=2070&auto=format&fit=crop'], stock: 6, description: 'Sustainable and stylish wall clock made from premium bamboo.', createdAt: '2026-01-06' },
  { id: 'b2', name: 'Bamboo Weave Mirror', price: 2800, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1974&auto=format&fit=crop'], stock: 2, description: 'Artisan woven mirror frame crafted from natural bamboo fibers.', createdAt: '2026-01-07' },
  { id: 'b3', name: 'Bamboo Tray Set', price: 1250, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1610444319409-72c8423605e5?q=80&w=1915&auto=format&fit=crop'], stock: 15, description: 'A versatile pair of bamboo serving trays for everyday utility.', createdAt: '2026-01-08' },
  { id: 'b4', name: 'Bamboo Desk Organizer', price: 899, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1591122941067-e455952bb74e?q=80&w=1974&auto=format&fit=crop'], stock: 12, description: 'Keep your workspace tidy with this eco-friendly bamboo desk organizer.', createdAt: '2026-01-09' },
  { id: 'b5', name: 'Bamboo Partition Screen', price: 7500, category: 'Bamboo Home Decor', images: ['https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=2070&auto=format&fit=crop'], stock: 1, description: 'A handcrafted room divider that adds warmth and privacy to any space.', createdAt: '2026-01-10' },

  // Lamps & Lighting
  { id: 'l1', name: 'Modern Bamboo Lamp', price: 3499, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'], stock: 10, description: 'Eco-modern table lamp designed to emit a soft, ambient glow.', createdAt: '2026-01-11' },
  { id: 'l2', name: 'Bamboo Pendant Light', price: 2600, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop'], stock: 7, description: 'A stunning woven ceiling lamp that creates beautiful light patterns.', createdAt: '2026-01-12' },
  { id: 'l3', name: 'Decorative Lantern', price: 1800, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1974&auto=format&fit=crop'], stock: 9, description: 'Geometric bamboo lantern perfect for indoor and outdoor settings.', createdAt: '2026-01-13' },
  { id: 'l4', name: 'Terracotta Night Lamp', price: 1450, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?q=80&w=2070&auto=format&fit=crop'], stock: 4, description: 'An earthy bedside lamp crafted from natural terracotta clay.', createdAt: '2026-01-14' },
  { id: 'l5', name: 'Crystal Bedside Lamp', price: 2200, category: 'Lamps & Lighting', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1974&auto=format&fit=crop'], stock: 11, description: 'A refined accent lighting piece with subtle crystal details.', createdAt: '2026-01-15' },
];
