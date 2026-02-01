import { useState, useEffect } from 'react';
import { Save, Upload, Trash2 } from 'lucide-react';
import Button from '../components/Button.jsx';
import Input, { Textarea, FileInput } from '../components/Input.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

export const HomeConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState([]);
  const [videoConfig, setVideoConfig] = useState({
    videoUrl: '',
    videoTitle: '',
  });
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    image: null,
    imagePreview: '',
  });

  // Fetch home config
  const fetchHomeConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/homeconfig');
      setBanners(data.data.banners || []);
      setVideoConfig(data.data.video || { videoUrl: '', videoTitle: '' });
    } catch (error) {
      toast.error('Failed to fetch home configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeConfig();
  }, []);

  // Handle banner image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner({
          ...newBanner,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add banner
  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imagePreview) {
      toast.error('Please fill all banner fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newBanner.title);
      formData.append('description', newBanner.description);
      if (newBanner.image) {
        formData.append('image', newBanner.image);
      }

      await api.post('/admin/homeconfig/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Banner added successfully');
      setNewBanner({ title: '', description: '', image: null, imagePreview: '' });
      fetchHomeConfig();
    } catch (error) {
      toast.error('Failed to add banner');
    }
  };

  // Handle delete banner
  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/admin/homeconfig/banners/${bannerId}`);
        toast.success('Banner deleted successfully');
        fetchHomeConfig();
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  // Handle save video config
  const handleSaveVideo = async () => {
    if (!videoConfig.videoUrl) {
      toast.error('Please enter video URL');
      return;
    }

    setSaving(true);
    try {
      await api.put('/admin/homeconfig/video', videoConfig);
      toast.success('Video configuration updated successfully');
      fetchHomeConfig();
    } catch (error) {
      toast.error('Failed to save video configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Home Configuration</h1>

      {/* Video Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Video Iframe Configuration</h2>

        <div className="space-y-4">
          <Input
            label="Video URL/Iframe"
            required
            value={videoConfig.videoUrl}
            onChange={(e) => setVideoConfig({ ...videoConfig, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
          />

          <Input
            label="Video Title"
            value={videoConfig.videoTitle}
            onChange={(e) => setVideoConfig({ ...videoConfig, videoTitle: e.target.value })}
            placeholder="Enter video title"
          />

          {/* Video Preview */}
          {videoConfig.videoUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={videoConfig.videoUrl}
                  title={videoConfig.videoTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveVideo}
            loading={saving}
            className="flex items-center gap-2"
          >
            <Save size={20} /> Save Video Configuration
          </Button>
        </div>
      </div>

      {/* Banners Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Banners Management</h2>

        {/* Add New Banner */}
        <div className="mb-8 pb-8 border-b">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Banner</h3>

          <div className="space-y-4">
            <Input
              label="Banner Title"
              required
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              placeholder="Enter banner title"
            />

            <Textarea
              label="Banner Description"
              value={newBanner.description}
              onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
              placeholder="Enter banner description"
              rows={2}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <FileInput
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {newBanner.imagePreview && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={newBanner.imagePreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddBanner}
              variant="success"
              className="flex items-center gap-2"
            >
              <Upload size={20} /> Add Banner
            </Button>
          </div>
        </div>

        {/* Existing Banners */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Banners</h3>

          {banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No banners added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{banner.title}</h4>
                    {banner.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {banner.description}
                      </p>
                    )}

                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} /> Delete Banner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeConfig;
