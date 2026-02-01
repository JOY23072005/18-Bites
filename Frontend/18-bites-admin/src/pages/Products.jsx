import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, Image as ImageIcon } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Input, { Select, FileInput, Textarea } from '../components/Input.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    image: null,
  });

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products', {
        params: { page, limit: pagination.limit, search: searchTerm },
      });
      setProducts(data.data.products);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        totalItems: data.data.totalItems,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchProducts(1);
    fetchCategories();
  }, [searchTerm]);

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category._id,
      status: product.status,
      image: null,
    });
    setIsModalOpen(true);
  };

  // Handle delete (set inactive)
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        toast.success('Product deactivated successfully');
        fetchProducts(pagination.page);
      } catch (error) {
        toast.error('Failed to deactivate product');
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully');
      }
      resetForm();
      fetchProducts(pagination.page);
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataBulk = new FormData();
    formDataBulk.append('file', file);

    setUploading(true);
    try {
      await api.post('/admin/products/bulk-upload', formDataBulk, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Bulk upload completed successfully');
      setIsBulkOpen(false);
      fetchProducts(1);
    } catch (error) {
      toast.error('Failed to upload bulk products');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      status: 'active',
      image: null,
      imagePreview: '',
    });
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkOpen(true)} variant="secondary" className="flex items-center gap-2">
            <Upload size={20} /> Bulk Upload
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} /> Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchProducts(page)}
        renderRow={(product) => (
          <tr key={product._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">₹{product.price}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name}</td>
            <td className="px-6 py-4 text-sm">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'active'
                    ? 'text-green-600 bg-green-100'
                    : 'text-red-600 bg-red-100'
                }`}
              >
                {product.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="text-primary-600 hover:text-primary-700 p-1"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />

          <Textarea
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter product description"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
            />

            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex gap-4">
              <FileInput
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {formData.imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <Select
            label="Status"
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
            <Button variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Upload Products"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with columns: name, description, price, category, status
          </p>
          <FileInput
            label="CSV File"
            accept=".csv"
            onChange={handleBulkUpload}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-primary-600">Uploading...</p>}
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={() => setIsBulkOpen(false)}
              className="flex-1"
              disabled={uploading}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
