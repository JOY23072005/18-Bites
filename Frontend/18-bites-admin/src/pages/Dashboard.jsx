import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, trend, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/dashboard/stats');
      console.log(data.data);
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Total Users"
              value={stats.totalUsers}
              color="#0ea5e9"
            />
            <StatCard
              icon={Users}
              title="Active Users"
              value={stats.activeUsers}
              color="#10b981"
            />
            <StatCard
              icon={Package}
              title="Total Products"
              value={stats.totalProducts}
              color="#f59e0b"
            />
            <StatCard
              icon={Package}
              title="Active Products"
              value={stats.activeProducts}
              color="#8b5cf6"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={ShoppingCart}
              title="Total Orders"
              value={stats.totalOrders}
              color="#ec4899"
            />
            <StatCard
              icon={ShoppingCart}
              title="Pending Orders"
              value={stats.pendingOrders}
              color="#f97316"
            />
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })}`}
              color="#06b6d4"
            />
            <StatCard
              icon={Users}
              title="Total Reviews"
              value={stats.totalReviews}
              color="#14b8a6"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/users"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600 mt-1">Add, edit, or delete users</p>
              </a>
              <a
                href="/products"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-600 mt-1">Add, edit, or delete products</p>
              </a>
              <a
                href="/orders"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900">View Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Track order status and details</p>
              </a>
              <a
                href="/coupons"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900">Manage Coupons</h3>
                <p className="text-sm text-gray-600 mt-1">Create and manage discounts</p>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
