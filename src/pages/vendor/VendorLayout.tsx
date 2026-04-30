import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ListOrdered, LogOut, Package, User } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    document.title = "Vendor Portal | Cratifue";
    
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
       if(docSnap.exists() && docSnap.data().logoUrl) {
          setLogoUrl(docSnap.data().logoUrl);
       }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/', { replace: true });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/vendor' },
    { icon: ShoppingBag, label: 'My Products', path: '/vendor/products' },
    { icon: ListOrdered, label: 'Orders', path: '/vendor/orders' },
    { icon: User, label: 'Profile Settings', path: '/vendor/profile' },
  ];

  return (
    <div className="flex bg-gray-50/50 h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-olive text-brand-cream hidden lg:flex flex-col flex-shrink-0 h-full shadow-2xl overflow-y-auto no-scrollbar">
        <div className="p-8 border-b border-brand-cream/10 sticky top-0 bg-brand-olive z-10">
          <Link to="/" className="flex flex-col items-center group">
             {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-auto h-12 object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
             ) : (
                <span className="font-serif text-xl font-bold tracking-tight group-hover:text-brand-gold transition-colors uppercase">CRATIFUE</span>
             )}
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold -mt-1">Vendor Portal</span>
          </Link>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                location.pathname === item.path 
                ? 'bg-brand-gold text-brand-olive font-bold shadow-lg transform -translate-x-2' 
                : 'hover:bg-brand-cream/10 text-brand-cream/60'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="text-sm tracking-wide shrink-0">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-6 right-10 z-50 flex items-center space-x-4">
           <button 
             onClick={handleLogout}
             className="flex items-center space-x-2 px-6 py-3 bg-white border border-brand-olive/10 hover:border-red-500 hover:bg-red-50 text-brand-olive hover:text-red-600 rounded-full shadow-lg transition-all transform hover:scale-105 font-bold uppercase tracking-widest text-[10px]"
           >
             <LogOut className="w-4 h-4" />
             <span>Sign Out</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 mt-16 lg:mt-0">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
