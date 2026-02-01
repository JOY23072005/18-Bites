import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Copy, Check } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Input, { Select, Textarea } from '../components/Input.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    maxUses: '',
    usedCount: 0,
    isActive: true,
  });

  // Fetch coupons
  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('api/admin/coupons', {
        params: { page, limit: pagination.limit, search: searchTerm },
      });

      setCoupons(data.data.coupons);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        totalItems: data.data.totalItems,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(1);
  }, [searchTerm]);

  // Handle edit
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscount: coupon.maxDiscount || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      maxUses: coupon.maxUses || '',
      usedCount: coupon.usedCount || 0,
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        toast.success('Coupon deleted successfully');
        fetchCoupons(pagination.page);
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', submitData);
        toast.success('Coupon created successfully');
      }

      setIsModalOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons(pagination.page);
    } catch (error) {
      toast.error(editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
    }
  };

  // Handle copy code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      maxUses: '',
      usedCount: 0,
      isActive: true,
    });
  };

  const columns = [
    { key: 'code', label: 'Coupon Code' },
    { key: 'discount', label: 'Discount' },
    { key: 'usageStatus', label: 'Usage' },
    { key: 'validity', label: 'Valid Until' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Coupons Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> Create Coupon
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Coupons Table */}
      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchCoupons(page)}
        renderRow={(coupon) => (
          <tr key={coupon._id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <button
                onClick={() => handleCopyCode(coupon.code)}
                className="flex items-center gap-2 font-mono font-bold text-primary-600 hover:text-primary-700"
              >
                {coupon.code}
                {copiedCode === coupon.code ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </td>
            <td className="px-6 py-4 text-sm">
              <span className="font-semibold">
                {coupon.discountType === 'percentage' ? '%' : '₹'}{coupon.discountValue}
              </span>
              {coupon.maxDiscount && (
                <p className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</p>
              )}
            </td>
            <td className="px-6 py-4 text-sm">
              <div>
                <p className="font-medium">{coupon.usedCount || 0} used</p>
                <p className="text-xs text-gray-500">
                  {coupon.maxUses ? `of ${coupon.maxUses}` : 'Unlimited'}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 text-sm">
              {coupon.validUntil ? (
                <div>
                  <p>{new Date(coupon.validUntil).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(coupon.validUntil), { addSuffix: true })}
                  </p>
                </div>
              ) : (
                'No expiry'
              )}
            </td>
            <td className="px-6 py-4 text-sm">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  coupon.isActive
                    ? 'text-green-600 bg-green-100'
                    : 'text-red-600 bg-red-100'
                }`}
              >
                {coupon.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
              <button
                onClick={() => handleEdit(coupon)}
                className="text-primary-600 hover:text-primary-700 p-1"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(coupon._id)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
          resetForm();
        }}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Coupon Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., SUMMER20"
            disabled={editingCoupon}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter coupon description"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              required
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Fixed Amount (₹)' },
              ]}
            />

            <Input
              label="Discount Value"
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              placeholder="0"
            />
          </div>

          <Input
            label="Minimum Order Value (₹)"
            type="number"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
            placeholder="0"
          />

          <Input
            label="Maximum Discount (₹)"
            type="number"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
            placeholder="Optional"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            />

            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <Input
            label="Maximum Uses"
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            placeholder="Leave blank for unlimited"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCoupon(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Coupons;
