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
import ForgotPassword from './pages/admin/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCMS from './pages/admin/AdminCMS';
import AdminWorkbook from './pages/admin/workbook/AdminWorkbook';
import Wishlist from './pages/Wishlist';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import AboutCraftifue from './pages/about/AboutCraftifue';
import MissionVision from './pages/about/MissionVision';
import ReturnPolicy from './pages/ReturnPolicy';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import StoreLocator from './pages/StoreLocator';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary id="app-error-boundary">
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin">
                  <Route path="login" element={<AdminLogin />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="cms" element={<AdminCMS />} />
                    <Route path="workbook" element={<AdminWorkbook />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* Client Routes */}
                <Route path="/*" element={
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
                        <Route path="/about/mission-vision" element={<MissionVision />} />
                        <Route path="/about/craftifue" element={<AboutCraftifue />} />
                        <Route path="/returns" element={<ReturnPolicy />} />
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/stores" element={<StoreLocator />} />
                        <Route path="/dashboard" element={
                          <PrivateRoute>
                            <Dashboard />
                          </PrivateRoute>
                        } />
                      </Routes>
                    </main>
                    <Footer id="main-footer" />
                  </div>
                } />
              </Routes>
            </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
