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
import ContactUs from './pages/ContactUs';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/admin/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendorDiscovery from './pages/admin/AdminVendorDiscovery';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCMS from './pages/admin/AdminCMS';
import AdminReviews from './pages/admin/AdminReviews';
import AdminVendors from './pages/admin/AdminVendors';
import AdminWorkbook from './pages/admin/workbook/AdminWorkbook';
import AdminAI from './pages/admin/AdminAI';
import Wishlist from './pages/Wishlist';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import AboutCraftifue from './pages/about/AboutCraftifue';
import MissionVision from './pages/about/MissionVision';
import ReturnPolicy from './pages/ReturnPolicy';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import StoreLocator from './pages/StoreLocator';
import VendorRegistration from './pages/VendorRegistration';
import Offers from './pages/Offers';
import FloatingGiftBox from './components/FloatingGiftBox';
import WhatsAppChatbot from './components/WhatsAppChatbot';

import AIPersonalizerModal from './components/AIPersonalizerModal';

import ErrorBoundary from './components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";

import { CompareProvider } from './contexts/CompareContext';
import Compare from './pages/Compare';
import CompareBar from './components/CompareBar';
import { ToastProvider } from './components/Toast';

import React, { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

function DynamicHead() {
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.faviconUrl;
        }
      }
    });
    return () => unsub();
  }, []);
  return null;
}

function App() {
  return (
    <ErrorBoundary id="app-error-boundary">
      <Analytics />
      <DynamicHead />
      <AuthProvider>
        <ToastProvider>
          <WishlistProvider>
          <CartProvider>
            <CompareProvider>
              <Router>
                <FloatingGiftBox />
                <WhatsAppChatbot />
                <AIPersonalizerModal />
                <CompareBar />
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
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="vendors" element={<AdminVendors />} />
                    <Route path="discovery" element={<AdminVendorDiscovery />} />
                    <Route path="cms" element={<AdminCMS />} />
                    <Route path="workbook" element={<AdminWorkbook />} />
                    <Route path="ai" element={<AdminAI />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="payments" element={<AdminPayments />} />
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
                        <Route path="/vendor-signup" element={<VendorRegistration />} />
                        <Route path="/customer-login" element={<CustomerLogin />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/about/mission-vision" element={<MissionVision />} />
                        <Route path="/about/craftifue" element={<AboutCraftifue />} />
                        <Route path="/returns" element={<ReturnPolicy />} />
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/stores" element={<StoreLocator />} />
                        <Route path="/compare" element={<Compare />} />
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
            </CompareProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
