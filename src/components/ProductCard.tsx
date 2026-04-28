import React from 'react';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFavorited = isInWishlist(product.id || '');

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
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleWishlistToggle}
            className={`bg-white/90 backdrop-blur-sm p-2.5 rounded-full transition-all shadow-md group ${isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 transition-transform group-active:scale-125 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-brand-olive text-brand-cream py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg"
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
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
