import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-brand-cream/30 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-brand-olive mb-4">Account Access</h2>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Select your journey path</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Signup Choice Box */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group"
          >
            <Link to="/signup" className="block h-full bg-white p-12 rounded-[3.5rem] border border-brand-olive/5 shadow-sm hover:shadow-xl hover:border-brand-gold/20 transition-all text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 blur-2xl font-bold" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
                  <UserPlus className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-olive mb-4">Customer Signup</h3>
                <p className="text-sm text-gray-500 mb-10 leading-relaxed">
                  Join our artisan community to track orders and save your delivery details.
                </p>
                <div className="inline-flex items-center space-x-3 bg-brand-gold text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-gold/20 group-hover:bg-brand-olive transition-colors">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Login Choice Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group"
          >
            <Link to="/customer-login" className="block h-full bg-white p-12 rounded-[3.5rem] border border-brand-olive/5 shadow-sm hover:shadow-xl hover:border-brand-gold/20 transition-all text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-olive/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-brand-olive/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
                  <LogIn className="w-8 h-8 text-brand-olive" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-olive mb-4">Customer Login</h3>
                <p className="text-sm text-gray-500 mb-10 leading-relaxed">
                  Welcome back! Proceed to view your handcrafted purchases and settings.
                </p>
                <div className="inline-flex items-center space-x-3 bg-brand-olive text-brand-cream px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-olive/20 group-hover:bg-brand-gold transition-colors">
                  <span>Authorize Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>


      </div>
    </div>
  );
}

