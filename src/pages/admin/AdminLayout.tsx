import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ListOrdered, Tag, LayoutPanelLeft, Home, FileText } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
    { icon: ListOrdered, label: 'Orders', path: '/admin/orders' },
    { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
    { icon: LayoutPanelLeft, label: 'Banners', path: '/admin/banners' },
    { icon: FileText, label: 'CMS Pages', path: '/admin/cms' },
    { icon: Home, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-olive text-brand-cream hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-8 border-b border-brand-cream/10">
          <Link to="/" className="flex flex-col items-center">
            <span className="font-serif text-xl font-bold tracking-tight">HANDCRAFTED</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold -mt-1">Admin Central</span>
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
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-brand-cream/10">
          <Link to="/" className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-brand-cream transition-colors">
            <Home className="w-4 h-4" />
            <span>Go to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
