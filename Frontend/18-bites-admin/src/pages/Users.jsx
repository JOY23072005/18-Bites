import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Input, { Select } from '../components/Input.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password:"",
    role: 'user',
    isActive: true,
  });

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('api/admin/users', {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm,
        },
      });

      setUsers(data.data.users);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        totalItems: data.data.totalItems,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm]);

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`api/admin/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers(pagination.page);
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (editingUser) {
        await api.put(`api/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('api/admin/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '',password:'', role: 'user', status: 'active' });
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(editingUser ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchUsers(page)}
        renderRow={(user) => (
          <tr key={user._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
            <td className="px-6 py-4 text-sm">
              <span className="px-3 py-1 text-xs font-semibold text-white bg-primary-500 rounded-full capitalize whitespace-nowrap">
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 text-sm">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  user.isActive
                    ? 'text-green-600 bg-green-100'
                    : 'text-red-600 bg-red-100'
                }`}
              >
                {user.isActive?"Active":"Inactive"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="text-primary-600 hover:text-primary-700 p-1"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(user._id)}
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
          setEditingUser(null);
          setFormData({ name: '', email: '',password:'', role: 'user', status: 'active' });
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter user name"
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email"
          />
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
          />

          <Select
            label="Role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
              { value: 'super-admin', label: 'Super Admin' },
            ]}
          />

          <Select
            label="Status"
            required
            value={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
            options={[
              { value: true, label: 'Active' },
              { value: false, label: 'Inactive' },
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {editingUser ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
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

export default Users;
