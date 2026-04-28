import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryProducts from './pages/CategoryProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import CreateAccount from './pages/CreateAccount';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import Wishlist from './pages/Wishlist';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import AboutCraftifue from './pages/about/AboutCraftifue';
import MissionVision from './pages/about/MissionVision';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
          <div className="flex flex-col min-h-screen">
            <Header id="main-header" />
            <main className="flex-grow pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:category" element={<CategoryProducts />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={
                  <PrivateRoute>
                    <Wishlist />
                  </PrivateRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<CreateAccount />} />
                <Route path="/customer-login" element={<CustomerLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/about/mission-vision" element={<MissionVision />} />
                <Route path="/about/craftifue" element={<AboutCraftifue />} />
                
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>
              </Routes>
            </main>
            <Footer id="main-footer" />
          </div>
        </Router>
      </CartProvider>
    </WishlistProvider>
  </AuthProvider>
  );
}

export default App;
