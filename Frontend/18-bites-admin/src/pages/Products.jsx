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
    SKU: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    isActive: true,
    isFeatured: false,
    images: [],
    existingImages: [],   // 👈 ADD
  });



  // Fetch products
  const fetchProducts = async (page = 1) => {
  setLoading(true);
  try {
    const { data } = await api.get("/api/products", {
      params: {
        page,
        limit: pagination.limit,
        search: searchTerm,
        status: "all",  // active | inactive | all
      },
    });
    setProducts(data.data.products);
    setPagination(data.data);
  } catch (error) {
    toast.error("Failed to fetch products");
  } finally {
    setLoading(false);
  }
};


  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data.data.categories);
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
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: previews,
    }));
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      SKU: product.SKU,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: [],
      existingImages: product.images || [],   // 👈 ADD THIS
    });


    setIsModalOpen(true);
  };

  // Handle delete (set inactive)
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts(pagination.page);
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  // Handle save
  const handleSave = async () => {
  try {
    const payload = {
      SKU: formData.SKU,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock,
      category: formData.category,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    let response;

    if (editingProduct) {
      response = await api.put(
        `/api/products/${editingProduct._id}`,
        payload
      );
      toast.success("Product updated successfully");
    } else {
      response = await api.post("/api/products", payload);
      toast.success("Product created successfully");
    }

    const productId = editingProduct
      ? editingProduct._id
      : response.data.product._id;

    // 🔥 Upload Images if selected
    if (formData.images.length > 0) {
      const imageForm = new FormData();
      formData.images.forEach((img) =>
        imageForm.append("images", img.file)
      );

      await api.post(
        `/api/products/${productId}/images`,
        imageForm,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }
    
    resetForm();
    fetchProducts(1);
  } catch (error) {
    toast.error("Operation failed");
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
      await api.post('/api/products/bulk/upload-csv', formDataBulk, {
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
      SKU: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      isActive: true,
      isFeatured: false,
      images: [],
      existingImages: [],
    });
  };

  const columns = [
  { key: "SKU", label: "SKU" },
  { key: "name", label: "Product Name" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "category", label: "Category" },
  { key: "isFeatured", label: "Featured" },
  { key: "isActive", label: "Status" },
  { key: "actions", label: "Actions" },
  { key: "hot-deal", label: "Set Hot Deal"}
  ];

  const handleSetHotDeal = async (id) => {
    try {
      const { data } = await api.put(`/api/products/${id}/hot-deal`);

      if (data.success) {
        toast.success("🔥 Product set as Hot Deal");
        fetchProducts(pagination.page);
      }
    } catch (err) {
      toast.error("Failed to set Hot Deal");
    }
  };

  const handleDeleteImage = async (publicId) => {
    try {
      await api.delete(`/api/products/${editingProduct._id}/images`, {
        data: { publicId },
      });

      setFormData((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter(
          (img) => img.publicId !== publicId
        ),
      }));

      toast.success("Image deleted");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };

  const moveImage = async (fromIndex, toIndex) => {
    const updated = [...formData.existingImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setFormData((prev) => ({
      ...prev,
      existingImages: updated,
    }));

    try {
      await api.put(
        `/api/products/${editingProduct._id}/images/reorder`,
        {
          order: updated.map((img) => img.publicId),
        }
      );

      toast.success("Images reordered");
    } catch (err) {
      toast.error("Failed to reorder");
    }
  };

  const moveNewImage = (fromIndex, toIndex) => {
    const updated = [...formData.images];

    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setFormData((prev) => ({
      ...prev,
      images: updated,
    }));
  };


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

            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.SKU}</td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">₹{product.price}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name}</td>
            <td className="px-6 py-4">
              {product.isFeatured ? (
                <span className="text-yellow-600 font-semibold">Yes</span>
              ) : (
                "No"
              )}
            </td>

            <td className="px-6 py-4 text-sm">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  product.isActive
                    ? 'text-green-600 bg-green-100'
                    : 'text-red-600 bg-red-100'
                }`}
              >
                {product.isActive?"Active":"Inactive"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-primary-600 hover:text-primary-700 hover:cursor-pointer p-1"
                >
                  <Edit2 size={18} />
                </button>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-600 hover:text-red-700 hover:cursor-pointer p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
            <td className="px-6 py-4 text-sm">
              <button
                onClick={() => handleSetHotDeal(product._id)}
                className="border border-transparent bg-primary-100 hover:bg-primary-200 rounded focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none hover:cursor-pointer"
              >
                🔥
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
          <Input
            label="SKU"
            required
            value={formData.SKU}
            onChange={(e) =>
              setFormData({ ...formData, SKU: e.target.value })
            }
          />

          <Input
            label="Stock"
            type="number"
            required
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
          />

          <Select
            label="Featured"
            value={formData.isFeatured}
            onChange={(e) =>
              setFormData({
                ...formData,
                isFeatured: e.target.value === "true",
              })
            }
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
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
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {/* New Selected Images Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg border"
                      />

                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>

                      {/* Reorder Controls */}
                      <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100">
                        {index > 0 && (
                          <button
                            onClick={() => moveNewImage(index, index - 1)}
                            className="bg-black text-white text-xs px-2 py-1 rounded"
                          >
                            ↑
                          </button>
                        )}
                        {index < formData.images.length - 1 && (
                          <button
                            onClick={() => moveNewImage(index, index + 1)}
                            className="bg-black text-white text-xs px-2 py-1 rounded"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formData.existingImages?.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.existingImages.map((img, index) => (
                    <div key={img.publicId} className="relative group">
                      <img
                        src={img.url}
                        alt="product"
                        className="w-full h-24 object-cover rounded-lg border"
                      />

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteImage(img.publicId)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>

                      {/* Reorder Controls */}
                      <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100">
                        {index > 0 && (
                          <button
                            onClick={() => moveImage(index, index - 1)}
                            className="bg-black text-white text-xs px-2 py-1 rounded"
                          >
                            ↑
                          </button>
                        )}
                        {index < formData.existingImages.length - 1 && (
                          <button
                            onClick={() => moveImage(index, index + 1)}
                            className="bg-black text-white text-xs px-2 py-1 rounded"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Select
            label="Status"
            value={formData.isActive ? "true" : "false"}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActive: e.target.value === "true",
              })
            }
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
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
