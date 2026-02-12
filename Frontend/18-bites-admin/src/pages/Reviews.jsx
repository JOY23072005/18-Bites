import { useState, useEffect } from 'react';
import { Trash2, Search, Star, MessageSquare } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import Input from '../components/Input.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newReview, setNewReview] = useState({
    sku: "",
    rating: 5,
    title: "",
    comment: ""
  });

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('api/admin/reviews', {
        params: {
          page,
          limit: pagination.limit,
          search: searchTerm,
          rating: ratingFilter,
        },
      });

      setReviews(data.data.reviews);
      setPagination({
        page: data.data.page,
        limit: data.data.limit,
        totalItems: data.data.totalItems,
        totalPages: data.data.totalPages,
      });
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [searchTerm, ratingFilter]);

  // Handle view review
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCreateReview = async () => {
    try {
      await api.post("api/admin/reviews", newReview);

      toast.success("Review created successfully");
      setIsCreateModalOpen(false);
      fetchReviews(1);
      setNewReview({
        sku: "",
        rating: 5,
        title: "",
        comment: ""
      })
    } catch (err) {
      toast.error("Failed to create review");
    }
  };


  // Handle delete review
  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`api/admin/reviews/${id}`);
        toast.success('Review deleted successfully');
        fetchReviews(pagination.page);
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const columns = [
    { key: 'SKU', label: 'SKU' },
    { key: 'product', label: 'Product' },
    { key: 'customer', label: 'Customer' },
    { key: 'rating', label: 'Rating' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Reviews Management
        </h1>

        <Button onClick={() => setIsCreateModalOpen("create")}>
          Create Fake Review
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by product or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews Table */}
      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchReviews(page)}
        renderRow={(review) => (
          <tr key={review._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {review.product?.SKU}
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {review.product?.name}
            </td>
            <td className="px-6 py-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">{review.user?.name}</p>
                <p className="text-xs text-gray-500">{review.user?.email}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-sm">
              {renderStars(review.rating)}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </td>
            <td className="px-6 py-4 text-sm flex gap-2">
              <button
                onClick={() => handleViewReview(review)}
                className="text-primary-600 hover:text-primary-700 p-1 flex items-center gap-1"
              >
                <MessageSquare size={18} /> View
              </button>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Review Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedReview.product?.name}
                </h3>
                <div className="mt-2">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
              <div className="bg-gray-50 rounded p-3 space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {selectedReview.user?.name}</p>
                <p><span className="font-medium">Email:</span> {selectedReview.user?.email}</p>
              </div>
            </div>

            {/* Title */}
            {selectedReview.title && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Review Title</h4>
                <p className="text-gray-700 font-medium">{selectedReview.title}</p>
              </div>
            )}

            {/* Comment */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Review Comment</h4>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.comment}</p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div>
                <p className="text-gray-500 text-xs">Posted</p>
                <p className="font-medium">
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Time ago</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(selectedReview.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={() => {
                handleDeleteReview(selectedReview._id);
                setIsModalOpen(false);
              }}
              className="w-full"
            >
              Delete Review
            </Button>

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
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Fake Review"
      >
        <div className="space-y-4">

          <Input
            label="Product SKU"
            value={newReview.sku}
            onChange={(e) =>
              setNewReview({ ...newReview, sku: e.target.value })
            }
          />

          <Input
            label="Rating (1-5)"
            type="number"
            min="1"
            max="5"
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: e.target.value })
            }
          />

          <Input
            label="Title"
            value={newReview.title}
            onChange={(e) =>
              setNewReview({ ...newReview, title: e.target.value })
            }
          />

          <textarea
            className="w-full border rounded p-2"
            placeholder="Review comment"
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          />

          <Button onClick={handleCreateReview} className="w-full">
            Create Review
          </Button>

        </div>
      </Modal>
    </div>
  );
};

export default Reviews;
