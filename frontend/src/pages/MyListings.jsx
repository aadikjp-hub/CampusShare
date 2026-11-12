
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Plus,
  Search,
  Package,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const categories = ["All", "Books", "Electronics", "Notes", "Stationery", "Sports", "Other"];
const conditions = ["New", "Like New", "Good", "Used"];
const resourceTypes = ["Borrow", "Sell", "Free"];

function MyListings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [actionMessage, setActionMessage] = useState("");

  const fetchMyListings = useCallback(async (isRefresh = false) => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await axios.get(`${API_URL}/resources/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResources(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");
        navigate("/login", { replace: true });
        return;
      }

      setError(err.response?.data?.detail || "Could not load your listings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const availableCount = resources.filter(
    (item) => (item.status || "Available") === "Available"
  ).length;

  const borrowedCount = resources.filter(
    (item) => item.status === "Borrowed"
  ).length;

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        item.title?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        (item.status || "Available") === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, search, selectedCategory, selectedStatus]);

  const handleDelete = async (resourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(resourceId);
    setActionMessage("");

    try {
      await axios.delete(`${API_URL}/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResources((previous) =>
        previous.filter((item) => item.id !== resourceId)
      );

      setActionMessage("Resource deleted successfully.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Could not delete resource."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditingResource((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingResource) return;

    setSaving(true);
    setActionMessage("");

    try {
      const response = await axios.put(
        `${API_URL}/resources/${editingResource.id}`,
        {
          title: editingResource.title.trim(),
          description: editingResource.description.trim(),
          category: editingResource.category,
          price: Number(editingResource.price),
          condition: editingResource.condition,
          resource_type: editingResource.resource_type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResources((previous) =>
        previous.map((item) =>
          item.id === editingResource.id
            ? { ...item, ...response.data }
            : item
        )
      );

      setEditingResource(null);
      setActionMessage("Resource updated successfully.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.detail || "Could not update resource."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditingResource({
      ...item,
      price: item.price ?? 0,
    });
  };

  const statusStyle = (status) => {
    if (status === "Available") return "bg-green-50 text-green-700";
    if (status === "Borrowed") return "bg-orange-50 text-orange-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-800">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white shadow-lg shadow-orange-500/20">
              <BookOpen size={23} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Campus<span className="text-orange-500">Share.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:flex"
            >
              <ArrowLeft size={17} /> Dashboard
            </Link>

            <Link
              to="/create-resource"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111a32] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
            >
              <Plus size={18} /> Add Resource
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:py-10">
        {/* Heading */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#111a32] via-[#202543] to-[#39233b] p-7 shadow-xl shadow-slate-900/10 sm:p-9">
          <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[40px] border-orange-400/10" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">
                Resource management
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                My Listings
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                Manage your shared resources, update details and keep track
                of what's available on campus.
              </p>
            </div>

            <button
              onClick={() => fetchMyListings(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Listings",
              value: resources.length,
              icon: Package,
              color: "bg-blue-50 text-blue-600",
              note: "Resources you shared",
            },
            {
              label: "Available",
              value: availableCount,
              icon: CheckCircle2,
              color: "bg-green-50 text-green-600",
              note: "Ready to be borrowed",
            },
            {
              label: "Borrowed",
              value: borrowedCount,
              icon: Clock,
              color: "bg-orange-50 text-orange-600",
              note: "Currently borrowed",
            },
          ].map(({ label, value, icon: Icon, color, note }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
                </div>
                <div className={`rounded-2xl p-3.5 ${color}`}>
                  <Icon size={23} />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400">{note}</p>
            </div>
          ))}
        </section>

        {/* Action feedback */}
        {actionMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              {actionMessage}
            </span>
            <button
              onClick={() => setActionMessage("")}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Search and filters */}
        <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search your listings..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <SlidersHorizontal size={15} /> Category
              </span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                    selectedCategory === category
                      ? "bg-[#111a32] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <span className="mr-1 self-center text-xs font-bold text-slate-400">
              Status:
            </span>
            {["All", "Available", "Borrowed"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  selectedStatus === status
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Results */}
        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Showing <span className="text-slate-900">{filteredResources.length}</span> listing{filteredResources.length !== 1 ? "s" : ""}
            </p>

            {(search || selectedCategory !== "All" || selectedStatus !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                }}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl bg-white">
                <div className="h-48 bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-10 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={() => fetchMyListings()}
              className="mt-4 rounded-xl bg-[#111a32] px-5 py-3 text-sm font-bold text-white hover:bg-orange-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredResources.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <BookOpen size={30} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {resources.length === 0 ? "No listings yet" : "No matching listings"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {resources.length === 0
                ? "You haven't shared any resources. Add your first listing and help another student."
                : "Try changing your search or filters to find your resources."}
            </p>

            {resources.length === 0 ? (
              <Link
                to="/create-resource"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <Plus size={17} /> Share your first resource
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                }}
                className="mt-5 font-bold text-orange-600"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Listing cards */}
        {!loading && !error && filteredResources.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((item) => {
              const status = item.status || "Available";

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      📚
                    </div>

                    {item.image_id && (
                      <img
                        src={`${API_URL}/images/${item.image_id}`}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm">
                      {item.category || "Other"}
                    </span>

                    <span className={`absolute right-4 top-4 rounded-lg px-3 py-1.5 text-xs font-extrabold shadow-sm ${statusStyle(status)}`}>
                      {status}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="line-clamp-1 text-lg font-black text-slate-900 transition group-hover:text-orange-600">
                      {item.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {item.description || "No description provided."}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">Condition</span>
                        <span className="font-semibold text-slate-700">{item.condition || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">Type</span>
                        <span className="font-semibold text-slate-700">{item.resource_type || "Borrow"}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xl font-black text-slate-900">
                        {Number(item.price) === 0 ? "Free" : `₹${item.price}`}
                      </p>
                      <Link
                        to={`/resources/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 transition hover:text-orange-700"
                      >
                        View details <ArrowUpRight size={15} />
                      </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#111a32] py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          CampusShare · Manage your resources, make sharing easier.
        </footer>
      </main>

      {/* Edit modal */}
      {editingResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditingResource(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#111a32] px-6 py-5 text-white sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                  Listing management
                </p>
                <h2 className="mt-1 text-xl font-black">Edit Resource</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                disabled={saving}
                className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close edit form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="max-h-[75vh] space-y-5 overflow-y-auto p-6 sm:p-8">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Resource title</label>
                <input
                  name="title"
                  value={editingResource.title || ""}
                  onChange={handleEditChange}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Enter resource title"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={editingResource.description || ""}
                  onChange={handleEditChange}
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  placeholder="Describe your resource..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Category</label>
                  <select
                    name="category"
                    value={editingResource.category || "Other"}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {categories.slice(1).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingResource.price ?? 0}
                    onChange={handleEditChange}
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Condition</label>
                  <select
                    name="condition"
                    value={editingResource.condition || "Good"}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {conditions.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Resource type</label>
                  <select
                    name="resource_type"
                    value={editingResource.resource_type || "Borrow"}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    {resourceTypes.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-extrabold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyListings;
