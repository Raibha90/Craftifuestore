import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingGiftBox() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on offers page or admin routes
  if (location.pathname === '/offers' || location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-6 left-6 z-50 flex flex-col items-start"
        >
          {/* Tooltip bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="mb-3 relative bg-brand-olive text-white px-4 py-2 rounded-2xl shadow-lg border border-brand-olive/20 ml-2"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Special Offers!</span>
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-brand-olive transform rotate-45 border-r border-b border-brand-olive/20" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-0.5 shadow-sm border border-gray-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>

          {/* Gift Box Button */}
          <motion.button
            onClick={() => navigate('/offers')}
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1, rotate: 0 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-brand-gold/30 rounded-full blur-xl group-hover:bg-brand-gold/50 transition-colors duration-500" />
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-gold to-yellow-300 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
              <Gift className="w-8 h-8 text-brand-olive fill-brand-olive/20 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            {/* Sparkles */}
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full blur-[1px]"
            />
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              className="absolute top-4 -left-3 w-2 h-2 bg-yellow-300 rounded-full blur-[1px]"
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
