import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Filter, ChevronDown } from 'lucide-react';

const mockProducts: Product[] = [
  { id: '1', name: 'Antique Brass Necklace', price: 2499, category: 'necklace', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop'], stock: 5, description: '', createdAt: '' },
  { id: '2', name: 'Handwoven Silk Saree', price: 8999, category: 'handmade-sarees', images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1974&auto=format&fit=crop'], stock: 2, description: '', createdAt: '' },
  { id: '3', name: 'Bamboo Lantern Set', price: 1299, category: 'bamboo-home-decor', images: ['https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=1915&auto=format&fit=crop'], stock: 10, description: '', createdAt: '' },
  { id: '4', name: 'Silver Meenakari Jhumkas', price: 1850, category: 'jewellery', images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'], stock: 8, description: '', createdAt: '' },
  { id: '5', name: 'Terracotta Vase', price: 1599, category: 'bamboo-home-decor', images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1974&auto=format&fit=crop'], stock: 4, description: '', createdAt: '' },
  { id: '6', name: 'Pearl Choker', price: 3200, category: 'necklace', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop'], stock: 3, description: '', createdAt: '' },
];

export default function CategoryProducts() {
  const { category } = useParams<{ category: string }>();

  const filteredProducts = useMemo(() => {
    if (!category || category === 'all') return mockProducts;
    return mockProducts.filter(p => p.category === category);
  }, [category]);

  const categoryTitle = category ? category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-brand-olive mb-4">{categoryTitle}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore our collection of {categoryTitle.toLowerCase()} handcrafted by expert artisans with premium materials.
        </p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 py-4 border-y border-brand-olive/10">
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-brand-olive">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <div className="h-4 w-[1px] bg-brand-olive/20" />
          <p className="text-xs text-gray-400 uppercase tracking-widest">{filteredProducts.length} Products Found</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className="text-sm text-gray-400">Sort by:</span>
          <button className="flex items-center space-x-2 text-sm font-medium text-brand-olive">
            <span>Featured</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-gray-500 italic">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
