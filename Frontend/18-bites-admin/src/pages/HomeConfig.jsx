import { useState, useEffect } from "react";
import { Save, Upload, Trash2 } from "lucide-react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import api from "../lib/api.js";
import toast from "react-hot-toast";

export const HomeConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState([]);

  const [videoIframeUrl, setVideoIframeUrl] = useState("");

  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    redirectUrl: "",
    desktopImage: null,
    mobileImage: null,
    desktopPreview: "",
    mobilePreview: "",
  });

  // ================= FETCH =================

  const fetchHomeConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/home", {
        params: { device: "desktop" },
      });

      setBanners(data.banners || []);
      setVideoIframeUrl(data.videoIframeUrl || "");
    } catch (err) {
      toast.error("Failed to fetch home configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeConfig();
  }, []);

  // ================= IMAGE HANDLER =================

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setNewBanner((prev) => ({
      ...prev,
      [type]: file,
      [`${type}Preview`]: preview,
    }));
  };

  // ================= ADD BANNER =================

  const handleAddBanner = async () => {
    if (!newBanner.desktopImage || !newBanner.mobileImage) {
      toast.error("Desktop and Mobile images required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newBanner.title);
      formData.append("subtitle", newBanner.subtitle);
      formData.append("redirectUrl", newBanner.redirectUrl);
      formData.append("desktopImage", newBanner.desktopImage);
      formData.append("mobileImage", newBanner.mobileImage);

      await api.post("/api/home", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Banner added successfully");

      setNewBanner({
        title: "",
        subtitle: "",
        redirectUrl: "",
        desktopImage: null,
        mobileImage: null,
        desktopPreview: "",
        mobilePreview: "",
      });

      fetchHomeConfig();
    } catch (err) {
      toast.error("Failed to add banner");
    }
  };

  // ================= DELETE BANNER =================

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      console.log("i am deleting");
      await api.delete(`/api/home/${bannerId}`);
      toast.success("Banner deleted");
      fetchHomeConfig();
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  // ================= SAVE VIDEO =================

  const handleSaveVideo = async () => {
    if (!videoIframeUrl) {
      toast.error("Video URL required");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/home/video", {
        videoIframeUrl,
      });

      toast.success("Video updated");
    } catch (err) {
      toast.error("Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Home Configuration</h1>

      {/* ================= VIDEO ================= */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold">Video Configuration</h2>

        <Input
          label="Video Iframe URL"
          value={videoIframeUrl}
          onChange={(e) => setVideoIframeUrl(e.target.value)}
          placeholder="https://www.youtube.com/embed/..."
        />

        {videoIframeUrl && (
          <div className="aspect-video rounded overflow-hidden bg-gray-100">
            <iframe
              src={videoIframeUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}

        <Button onClick={handleSaveVideo} loading={saving}>
          <Save size={18} /> Save Video
        </Button>
      </div>

      {/* ================= ADD BANNER ================= */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold">Add New Banner</h2>

        <Input
          label="Title"
          value={newBanner.title}
          onChange={(e) =>
            setNewBanner({ ...newBanner, title: e.target.value })
          }
        />

        <Input
          label="Subtitle"
          value={newBanner.subtitle}
          onChange={(e) =>
            setNewBanner({ ...newBanner, subtitle: e.target.value })
          }
        />

        <Input
          label="Redirect URL"
          value={newBanner.redirectUrl}
          onChange={(e) =>
            setNewBanner({ ...newBanner, redirectUrl: e.target.value })
          }
        />

        {/* Desktop Image */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Desktop Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "desktopImage")}
          />
          {newBanner.desktopPreview && (
            <img
              src={newBanner.desktopPreview}
              className="mt-2 h-32 rounded border"
            />
          )}
        </div>

        {/* Mobile Image */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Mobile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "mobileImage")}
          />
          {newBanner.mobilePreview && (
            <img
              src={newBanner.mobilePreview}
              className="mt-2 h-32 rounded border"
            />
          )}
        </div>

        <Button onClick={handleAddBanner}>
          <Upload size={18} /> Add Banner
        </Button>
      </div>

      {/* ================= EXISTING BANNERS ================= */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Current Banners</h2>

        {banners.length === 0 ? (
          <p className="text-gray-500">No banners available</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="border rounded-lg overflow-hidden"
              >
                <img
                  src={banner.imageUrl}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{banner.title}</h3>
                  <p className="text-sm text-gray-600">
                    {banner.subtitle}
                  </p>

                  <button
                    onClick={() => handleDeleteBanner(banner._id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeConfig;
