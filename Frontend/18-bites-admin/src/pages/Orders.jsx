import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import Input, { Select } from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('api/admin/orders', {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter,
        },
      });

      setOrders(data.data.orders);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        totalItems: data.data.totalItems,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [searchTerm, statusFilter]);

  // Handle view order
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      await api.patch(`api/admin/orders/${selectedOrder._id}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      fetchOrders(pagination.page);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      processing: 'bg-blue-100 text-blue-600',
      shipped: 'bg-purple-100 text-purple-600',
      delivered: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchOrders(page)}
        renderRow={(order) => (
          <tr key={order._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
              #{order.orderId}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">{order.customer?.name}</p>
                <p className="text-xs text-gray-500">{order.customer?.email}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
              ₹{order.totalAmount?.toFixed(2)}
            </td>
            <td className="px-6 py-4 text-sm">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </td>
            <td className="px-6 py-4 text-sm">
              <button
                onClick={() => handleViewOrder(order)}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1 p-1"
              >
                <Eye size={18} /> View
              </button>
            </td>
          </tr>
        )}
      />

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Order Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-xs font-semibold text-gray-500">Order ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">#{selectedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {selectedOrder.customer?.name}</p>
                <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{item.productName} x {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{(selectedOrder.totalAmount - (selectedOrder.tax || 0)).toFixed(2)}</span>
              </div>
              {selectedOrder.tax && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{selectedOrder.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base">
                <span>Total:</span>
                <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <div className="flex gap-2">
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </div>
              {updatingStatus && <p className="text-xs text-primary-600 mt-1">Updating...</p>}
            </div>

            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
