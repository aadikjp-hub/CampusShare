
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function MyListings() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMyListings = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8001/resources/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResources(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not load your listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    fetchMyListings();
  }, [navigate]);

  const handleDelete = async (resourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8001/resources/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Resource deleted successfully!");
      fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not delete resource.");
    }
  };

  const handleEditChange = (e) => {
    setEditingResource({
      ...editingResource,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axios.put(
        `http://127.0.0.1:8001/resources/${editingResource.id}`,
        {
          title: editingResource.title,
          description: editingResource.description,
          category: editingResource.category,
          price: Number(editingResource.price),
          condition: editingResource.condition,
          resource_type: editingResource.resource_type,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Resource updated successfully!");
      setEditingResource(null);
      fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not update resource.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-blue-600 mb-8"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Listings
            </h1>
            <p className="text-slate-500 mt-2">
              Manage resources you have shared.
            </p>
          </div>

          <button
            onClick={fetchMyListings}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {loading && (
          <p className="text-blue-600">Loading your listings...</p>
        )}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="bg-white rounded-2xl border p-10 text-center">
            <BookOpen size={42} className="mx-auto text-slate-400" />
            <h2 className="text-xl font-bold mt-4">No listings yet</h2>
            <p className="text-slate-500 mt-2">
              You haven't shared any resources.
            </p>

            <Link
              to="/create-resource"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl"
            >
              Share Your First Resource
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-2xl p-6 shadow-sm"
            >
              <BookOpen size={28} className="text-blue-600 mb-4" />

              <h2 className="text-xl font-bold">{item.title}</h2>

              <p className="text-slate-500 mt-2">{item.description}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Category: {item.category}</p>
                <p>Condition: {item.condition}</p>
                <p>Type: {item.resource_type}</p>
                <p>Price: ₹{item.price}</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingResource({ ...item })}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg"
                >
                  <Pencil size={16} /> Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {editingResource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold">Edit Resource</h2>

                <button onClick={() => setEditingResource(null)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">

                <input
                  name="title"
                  value={editingResource.title}
                  onChange={handleEditChange}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Resource title"
                  className="w-full border p-3 rounded-lg"
                />

                <textarea
                  name="description"
                  value={editingResource.description}
                  onChange={handleEditChange}
                  required
                  minLength={10}
                  maxLength={1000}
                  placeholder="Description"
                  className="w-full border p-3 rounded-lg"
                  rows="4"
                />

                <select
                  name="category"
                  value={editingResource.category}
                  onChange={handleEditChange}
                  className="w-full border p-3 rounded-lg"
                >
                  {["Books", "Electronics", "Notes", "Stationery", "Sports", "Other"].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>

                <input
                  type="number"
                  name="price"
                  value={editingResource.price}
                  onChange={handleEditChange}
                  min="0"
                  required
                  placeholder="Price"
                  className="w-full border p-3 rounded-lg"
                />

                <select
                  name="condition"
                  value={editingResource.condition}
                  onChange={handleEditChange}
                  className="w-full border p-3 rounded-lg"
                >
                  {["New", "Like New", "Good", "Used"].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>

                <select
                  name="resource_type"
                  value={editingResource.resource_type}
                  onChange={handleEditChange}
                  className="w-full border p-3 rounded-lg"
                >
                  {["Borrow", "Sell", "Free"].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingResource(null)}
                    className="flex-1 border py-3 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyListings;
