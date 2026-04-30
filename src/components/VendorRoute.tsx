import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function VendorRoute({ children }: { children: React.ReactNode }) {
  const { isVendor, loading } = useAuth();

  if (loading) return null;
  return isVendor ? children : <Navigate to="/login" />;
}
