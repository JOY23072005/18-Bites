import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Users,
  Package,
  List,
  Home,
  ShoppingCart,
  Ticket,
  Star,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/categories', label: 'Categories', icon: List },
    { path: '/homeconfig', label: 'Home Config', icon: Settings },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/coupons', label: 'Coupons', icon: Ticket },
    { path: '/reviews', label: 'Reviews', icon: Star },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-primary-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed max-md:w-full left-0 top-0 h-screen bg-gradient-to-b from-primary-700 to-primary-900 text-white w-64 transform transition-transform lg:translate-x-0 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-600">
          <div className="flex items-center justify-center">
            <div>
              <div className="w-25 h-17 overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dgwx34lqc/image/upload/v1770875314/LOGO_jfhzkk.png"
                  className="w-full h-full object-cover object-top scale-150"
                  alt="Logo"
                />
              </div>
              <p className="ml-7 text-xs text-primary-200">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-4">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive(path)
                  ? 'bg-secondary-400 text-gray-900 font-semibold'
                  : 'text-primary-100 hover:bg-primary-600'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-primary-600 bg-primary-800 p-4">
          <div className="text-sm mb-4">
            <p className="font-semibold text-primary-100">{user?.name}</p>
            <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
          </div>

          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full hover:cursor-pointer flex items-center gap-2 bg-red-800/100 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64" />
    </>
  );
};

export default Sidebar;
