
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Upload } from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8001/resources/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Resource created successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not create resource."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <Upload size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Share a Resource
              </h1>
              <p className="text-slate-500 text-sm">
                Help another student by sharing your resources.
              </p>
            </div>
          </div>

          {error && (
            <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-5">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-semibold mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Python Programming Book"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your resource..."
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              >
                <option>Books</option>
                <option>Electronics</option>
                <option>Notes</option>
                <option>Stationery</option>
                <option>Sports</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Used</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Resource Type</label>
              <select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleChange}
                className="w-full border rounded-xl p-3"
              >
                <option value="Borrow">Borrow</option>
                <option value="Sell">Sell</option>
                <option value="Free">Free</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Resource"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateResource;
