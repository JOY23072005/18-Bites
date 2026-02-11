import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import Input, { FileInput } from "../components/Input.jsx";
import api from "../lib/api.js";
import toast from "react-hot-toast";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    showHome: false,     // ✅ NEW
    image: null,
    preview: null,      // ✅ NEW
    existingImage: null,
  });

  // ================= FETCH =================

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/categories", {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm,
          status: "all",
        },
      });

      setCategories(data.data.categories);
      setPagination(data.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, [searchTerm]);

  // ================= EDIT =================

  const handleEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      showHome: category.showHome || false,  // ✅ NEW
      image: null,
      preview: null,
      existingImage: category.image || null,
    });

    setIsModalOpen(true);
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deactivated");
      fetchCategories(pagination.page);
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // ================= SAVE =================

  const handleSave = async () => {
    try {
      let response;

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        showHome: formData.showHome,  // ✅ SEND TO BACKEND
      };

      if (editingCategory) {
        response = await api.put(
          `/api/categories/${editingCategory._id}`,
          payload
        );
        toast.success("Category updated");
      } else {
        response = await api.post("/api/categories", payload);
        toast.success("Category created");
      }

      const categoryId = editingCategory
        ? editingCategory._id
        : response.data.category._id;

      // Upload image
      if (formData.image) {
        const imgForm = new FormData();
        imgForm.append("image", formData.image);

        await api.post(
          `/api/categories/${categoryId}/image`,
          imgForm,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      resetForm();
      fetchCategories(1);

    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),  // ✅ PREVIEW
    }));
  };

  // ================= IMAGE DELETE =================

  const handleDeleteImage = async () => {
    if (!editingCategory) return;
    if (!window.confirm("Remove this image?")) return;
    try {
      await api.delete(
        `/api/categories/${editingCategory._id}/image`
      );

      setFormData((prev) => ({
        ...prev,
        existingImage: null,
      }));

      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };


  const resetForm = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      existingImage: null,
    });
  };

  // ================= TABLE =================

  const columns = [
    { key: "name", label: "Category Name" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Category
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchCategories(page)}
        renderRow={(category) => (
          <tr key={category._id} className="hover:bg-gray-50">
            <td className="px-6 py-4">{category.name}</td>
            <td className="px-6 py-4">{category.slug}</td>
            <td className="px-6 py-4 truncate max-w-xs">
              {category.description}
            </td>
            <td className="px-6 py-4">
              {category.isActive ? "Active" : "Inactive"}
            </td>
            <td className="px-6 py-4 flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="text-blue-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(category._id)}
                className="text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        )}
      />

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">

          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* ✅ showHome Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.showHome}
              onChange={(e) =>
                setFormData({ ...formData, showHome: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">
              Show on Home Page
            </label>
          </div>

          {/* IMAGE INPUT */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded"
          />

          {/* ✅ PREVIEW (New Image) */}
          {formData.preview && (
            <div className="relative w-32 h-32">
              <img
                src={formData.preview}
                alt="preview"
                className="w-full h-full object-cover rounded border"
              />
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    image: null,
                    preview: null,
                  }))
                }
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          )}

          {/* ✅ EXISTING IMAGE */}
          {!formData.preview && formData.existingImage && (
            <div className="relative w-32 h-32 group">
              <img
                src={formData.existingImage.url}
                alt="category"
                className="w-full h-full object-cover rounded border"
              />

              {/* Delete Button */}
              <button
                onClick={handleDeleteImage}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          )}


          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {editingCategory ? "Update" : "Create"}
            </Button>
            <Button variant="secondary" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
