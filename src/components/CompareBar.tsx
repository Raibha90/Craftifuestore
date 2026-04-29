import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCompare } from '../contexts/CompareContext';
import { X, GitCompare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  if (compareList.length === 0 || location.pathname === '/compare') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 sm:p-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {compareList.map((product) => (
              <div key={product.id} className="relative flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {compareList.length < 4 && (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <span className="text-xl">+</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">{4 - compareList.length} slot</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={clearCompare}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block whitespace-nowrap"
            >
              Clear All
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-olive text-brand-cream px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-md group"
            >
              <GitCompare className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-sm tracking-widest uppercase">Compare Now ({compareList.length})</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareBar;
