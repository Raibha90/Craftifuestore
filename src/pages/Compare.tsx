import React from 'react';
import { useCompare } from '../contexts/CompareContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, CheckCircle2, GitCompare } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';

const Compare: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <GitCompare className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-3xl font-serif text-[#1A1A3F] mb-4">Compare Products</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">You haven't added any products to compare yet. Browse our collection and select up to 4 items.</p>
        <Link 
          to="/" 
          className="bg-brand-olive text-brand-cream px-8 py-4 rounded-full font-bold tracking-widest uppercase hover:bg-opacity-90 transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
        <div>
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-olive mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shopping
          </Link>
          <h1 className="text-4xl text-[#1A1A3F] font-serif tracking-tight">Compare Products</h1>
        </div>
        <button 
          onClick={clearCompare}
          className="text-sm text-red-500 hover:text-red-600 flex items-center mt-4 sm:mt-0 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Clear All Items
        </button>
      </div>

      <div className="w-full overflow-x-auto hide-scrollbar pb-8">
        <table className="w-full text-left min-w-[800px] border-collapse bg-white shadow-sm rounded-2xl overflow-hidden">
          <thead>
            {/* Headers / Images */}
            <tr>
              <th className="p-6 bg-gray-50 border-r border-b border-gray-100 min-w-[200px] align-top text-gray-400 font-medium uppercase tracking-widest text-xs">
                Product Details
              </th>
              {compareList.map((product) => (
                <th key={product.id} className="p-6 border-r border-b border-gray-100 w-1/4 align-top relative group">
                  <button 
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-4 right-4 bg-white shadow-md rounded-full p-2 text-gray-400 hover:text-red-500 z-10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link to={`/product/${product.id}`} className="block block group">
                    <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-50">
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="font-serif text-lg text-[#1A1A3F] leading-tight mb-2 group-hover:text-brand-olive transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-brand-gold font-bold text-xl mb-1">
                    ₹{product.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">+ 18% GST: ₹{Math.round(product.price * 0.18).toLocaleString()}</p>
                </th>
              ))}
              {/* Empty slots placeholders */}
              {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <th key={`empty-h-${i}`} className="p-6 border-r border-b border-gray-100 w-1/4 bg-gray-50/50">
                   <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                     Empty Slot
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Action Row */}
            <tr className="bg-gray-50/50">
              <td className="p-6 border-r border-b border-gray-100 text-sm font-bold text-gray-600">Action</td>
              {compareList.map((product) => (
                <td key={`cart-${product.id}`} className="p-6 border-r border-b border-gray-100 text-center">
                  <button
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className="w-full bg-brand-olive hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl flex items-center justify-center transition-colors text-sm font-bold tracking-wider"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </td>
              ))}
               {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <td key={`empty-c-${i}`} className="p-6 border-r border-b border-gray-100"></td>
              ))}
            </tr>

            {/* Category Row */}
            <tr>
              <td className="p-6 bg-gray-50 border-r border-b border-gray-100 text-sm font-bold text-gray-600">Category</td>
              {compareList.map((product) => (
                <td key={`cat-${product.id}`} className="p-6 border-r border-b border-gray-100 text-gray-700 capitalize">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">{product.category}</span>
                </td>
              ))}
               {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <td key={`empty-cat-${i}`} className="p-6 border-r border-b border-gray-100"></td>
              ))}
            </tr>

             {/* Material Row */}
             <tr>
              <td className="p-6 bg-gray-50 border-r border-b border-gray-100 text-sm font-bold text-gray-600">Material</td>
              {compareList.map((product) => (
                <td key={`mat-${product.id}`} className="p-6 border-r border-b border-gray-100 text-gray-700">
                  {product.material || <span className="text-gray-400 italic">Not specified</span>}
                </td>
              ))}
               {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <td key={`empty-mat-${i}`} className="p-6 border-r border-b border-gray-100"></td>
              ))}
            </tr>

            {/* Availability Row */}
            <tr>
              <td className="p-6 bg-gray-50 border-r border-b border-gray-100 text-sm font-bold text-gray-600">Availability</td>
              {compareList.map((product) => (
                <td key={`stock-${product.id}`} className="p-6 border-r border-b border-gray-100">
                   {product.stock > 0 ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> In Stock ({product.stock})
                    </span>
                   ) : (
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                   )}
                </td>
              ))}
               {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <td key={`empty-stock-${i}`} className="p-6 border-r border-b border-gray-100"></td>
              ))}
            </tr>

            {/* Description Row */}
             <tr>
              <td className="p-6 bg-gray-50 border-r border-b border-gray-100 text-sm font-bold text-gray-600">Description</td>
              {compareList.map((product) => (
                <td key={`desc-${product.id}`} className="p-6 border-r border-b border-gray-100 text-gray-600 text-sm leading-relaxed align-top">
                  {product.description.length > 150 ? `${product.description.substring(0, 150)}...` : product.description}
                </td>
              ))}
               {Array.from({ length: Math.max(0, 4 - compareList.length) }).map((_, i) => (
                <td key={`empty-desc-${i}`} className="p-6 border-r border-b border-gray-100"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
