import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header({ id }: { id: string }) {
  const { totalItems } = useCart();
  const { user, profile, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ['Necklace', 'Bangles', 'Rings', 'Handmade Sarees', 'Bamboo Home Decor'];

  return (
    <header id={id} className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-olive/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <span className="font-serif text-2xl font-bold tracking-tight text-brand-olive">HANDCRAFTED</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold -mt-1">Home & Jewellery</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-gray-600 hover:text-brand-olive transition-colors underline-offset-8 hover:underline"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="text-gray-600 hover:text-brand-olive">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="relative text-gray-600 hover:text-brand-olive">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="text-gray-600 hover:text-brand-olive">
              <User className="w-5 h-5" />
            </Link>
            {isAdmin && (
              <Link to="/admin" className="hidden lg:block text-xs font-bold text-brand-olive hover:text-brand-gold">
                ADMIN
              </Link>
            )}
            <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-cream border-t border-brand-olive/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="block text-base font-medium text-gray-600 hover:text-brand-olive"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block text-base font-bold text-brand-gold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
