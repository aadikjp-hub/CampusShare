
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Upload, ImagePlus, X, BookOpen,
  Tag, IndianRupee, CheckCircle2
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

function CreateResource() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Books",
    price: 0,
    condition: "Good",
    resource_type: "Borrow",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    const input = document.getElementById("resource-image");
    if (input) input.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageId = null;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const imageResponse = await axios.post(
          `${API_URL}/images/upload`,
          uploadData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        imageId = imageResponse.data.image_id;
      }

      await axios.post(
        `${API_URL}/resources/`,
        { ...formData, image_id: imageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/dashboard", {
        replace: true,
        state: { resourceCreated: true },
      });
    } catch (err) {
      console.error("Create resource error:", err);
      setError(err.response?.data?.detail || "Could not create resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white"><BookOpen size={23} /></div>
            <span className="text-xl font-black text-slate-900">Campus<span className="text-orange-500">Share.</span></span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600"><ArrowLeft size={17} /> Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-9 sm:px-8">
        <section className="mb-7 rounded-[28px] bg-gradient-to-r from-[#111a32] to-[#39233b] p-8 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Give something useful</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Share a Resource</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Add a resource and help another student in your campus community.</p>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
          {error && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Resource title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={100}
                placeholder="e.g. Python Programming Book"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="Describe your resource, its features and how students can use it..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
                  {["Books", "Electronics", "Notes", "Stationery", "Sports", "Other"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
                  {["New", "Like New", "Good", "Used"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Resource type</label>
                <select name="resource_type" value={formData.resource_type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
                  <option value="Borrow">Borrow</option>
                  <option value="Sell">Sell</option>
                  <option value="Free">Free</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Price (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input type="number" name="price" min="0" value={formData.price} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Resource image</label>
              <label htmlFor="resource-image" className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50/50">
                <div className="mb-3 rounded-2xl bg-orange-100 p-3 text-orange-600"><ImagePlus size={28} /></div>
                <span className="text-sm font-bold text-slate-700">Click to upload an image</span>
                <span className="mt-1 text-xs text-slate-400">JPG, PNG or WEBP · Maximum 5 MB</span>
                <input id="resource-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              </label>

              {imagePreview && (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                  <img src={imagePreview} alt="Resource preview" className="max-h-64 w-full rounded-xl object-contain" />
                  <button type="button" onClick={handleRemoveImage} aria-label="Remove selected image" className="absolute right-4 top-4 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"><X size={17} /></button>
                  <p className="px-2 py-2 text-xs font-medium text-green-700">Selected: {imageFile?.name}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 text-sm leading-5 text-orange-800">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              Please make sure your resource details and price are accurate before publishing.
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button type="button" onClick={() => navigate("/dashboard")} disabled={loading} className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-extrabold text-white transition hover:bg-orange-600 disabled:opacity-50">
                <Upload size={18} /> {loading ? "Uploading and publishing..." : "Publish Resource"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateResource;
