import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Auth & Routes
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Categories from './pages/Categories';
import HomeConfig from './pages/HomeConfig';
import Orders from './pages/Orders';
import Coupons from './pages/Coupons';
import Reviews from './pages/Reviews';

export const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1">
                  <Header />
                  <div className="mt-16 lg:mt-0">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/homeconfig" element={<HomeConfig />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/coupons" element={<Coupons />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
