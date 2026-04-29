import React from 'react';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useCompare } from '../contexts/CompareContext';
import { ShoppingCart, Heart, GitCompare } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  const isFavorited = isInWishlist(product.id || '');
  const isCompared = isInCompare(product.id || '');

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorited) {
      await removeFromWishlist(product.id || '');
    } else {
      await addToWishlist(product.id || '');
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id || '');
    } else {
      addToCompare(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 relative">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0] || 'https://via.placeholder.com/600x800?text=Handcrafted+Product'}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistToggle}
            className={`bg-white/90 backdrop-blur-sm p-2.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500 hover:shadow-lg'}`}
          >
            <motion.div animate={isFavorited ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </motion.div>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleCompareToggle}
            className={`bg-white/90 backdrop-blur-sm p-2.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center ${isCompared ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive hover:shadow-lg'}`}
            title={isCompared ? "Remove from Compare" : "Add to Compare"}
          >
             <GitCompare className={`w-4 h-4 transition-colors ${isCompared ? 'text-brand-olive' : ''}`} />
          </motion.button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-brand-olive text-brand-cream py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg hover:bg-brand-olive/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      <div className="mt-4 px-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-brand-olive transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            {product.category}
          </p>
          <p className="mt-2 text-sm font-medium text-brand-gold">
            ₹{product.price.toLocaleString()}
          </p>
          <div className="mt-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">+ 18% GST: ₹{Math.round(product.price * 0.18).toLocaleString()}</p>
            <p className="text-sm font-bold text-brand-olive mt-0.5">Total: ₹{Math.round(product.price * 1.18).toLocaleString()}</p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
