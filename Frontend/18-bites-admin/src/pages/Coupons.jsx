import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Copy, Check } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    isActive: true,
  });

  /* ================= FETCH ================= */

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/coupons', {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter,
        },
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
  }, [searchTerm, statusFilter]);

  const handleStatusToggle = async (coupon) => {
    try {
      await api.patch(`/api/coupons/${coupon._id}/status`, {
        isActive: !coupon.isActive
      });

      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
      fetchCoupons(pagination.page);

    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this coupon?')) return;

    try {
      await api.delete(`/api/coupons/${id}`);
      toast.success('Coupon deactivated successfully');
      fetchCoupons(pagination.page);
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      };

      await api.post('/api/coupons', submitData);

      toast.success('Coupon created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchCoupons(1);
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  /* ================= COPY ================= */

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  /* ================= RESET ================= */

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
      isActive: true,
    });
  };

  /* ================= TABLE ================= */

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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Coupons' },
            { value: 'active', label: 'Active' },
            { value: 'expired', label: 'Expired' },
            { value: 'upcoming', label: 'Upcoming' },
          ]}
        />
      </div>

      {/* Table */}
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
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
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
              <label className="inline-flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  checked={coupon.isActive}
                  onChange={() => handleStatusToggle(coupon)}
                  className="sr-only peer"
                />

                {/* Track */}
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>

                {/* Ball */}
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
              </label>
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
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
          resetForm();
        }}
        title="Create New Coupon"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Coupon Code"
            required
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="e.g., SUMMER20"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter coupon description"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              required
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value })
              }
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'flat', label: 'Flat Amount (₹)' },
              ]}
            />

            <Input
              label="Discount Value"
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <Input
            label="Minimum Order Value (₹)"
            type="number"
            value={formData.minOrderValue}
            onChange={(e) =>
              setFormData({ ...formData, minOrderValue: e.target.value })
            }
            placeholder="0"
          />

          <Input
            label="Maximum Discount (₹)"
            type="number"
            value={formData.maxDiscount}
            onChange={(e) =>
              setFormData({ ...formData, maxDiscount: e.target.value })
            }
            placeholder="Optional"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) =>
                setFormData({ ...formData, validFrom: e.target.value })
              }
            />

            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
            />
          </div>

          <Input
            label="Maximum Uses"
            type="number"
            value={formData.maxUses}
            onChange={(e) =>
              setFormData({ ...formData, maxUses: e.target.value })
            }
            placeholder="Leave blank for unlimited"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              Create
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
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