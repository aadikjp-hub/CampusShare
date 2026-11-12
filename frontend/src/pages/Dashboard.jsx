
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  UserRound,
  ClipboardList,
  Inbox,
  Package,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  GraduationCap,
  Menu,
  X,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      "{}"
    );
  } catch {
    return {};
  }
};

const categoriesList = [
  "All",
  "Books",
  "Electronics",
  "Notes",
  "Stationery",
  "Sports",
  "Other",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const [resources, setResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchResources = useCallback(async (showRefresh = false) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch(`${API_URL}/resources/`, { headers });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("currentUser");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch resources");

      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Resource loading error:", err);
      setError("Unable to load resources. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [headers, navigate, token]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      const [requestsResponse, myResourcesResponse] = await Promise.all([
        fetch(`${API_URL}/resources/requests/incoming`, { headers }),
        fetch(`${API_URL}/resources/my`, { headers }),
      ]);

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        setPendingRequests(
          Array.isArray(requests)
            ? requests.filter((request) => request.status === "Pending").length
            : 0
        );
      }

      if (myResourcesResponse.ok) {
        const data = await myResourcesResponse.json();
        setMyResources(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Dashboard statistics error:", err);
    }
  }, [headers, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchResources();
    fetchDashboardData();
  }, [token, navigate, fetchResources, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    navigate("/login", { replace: true });
  };

  const filteredResources = resources.filter((resource) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      resource.title?.toLowerCase().includes(searchText) ||
      resource.description?.toLowerCase().includes(searchText) ||
      resource.category?.toLowerCase().includes(searchText) ||
      resource.owner_name?.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const availableCount = resources.filter(
    (resource) => (resource.status || "Available") === "Available"
  ).length;

  const borrowedCount = resources.filter(
    (resource) => resource.status === "Borrowed"
  ).length;

  const firstName = user?.name?.trim()?.split(" ")[0] || "Student";
  const initials = (user?.name || "S")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navigation = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Listings", path: "/my-listings", icon: Package },
    { label: "My Requests", path: "/my-requests", icon: ClipboardList },
    { label: "Incoming Requests", path: "/incoming-requests", icon: Inbox, badge: pendingRequests },
    { label: "My Profile", path: "/profile", icon: UserRound },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[265px] flex-col bg-[#111a32] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={closeSidebar}
          className="flex items-center gap-3 border-b border-white/10 px-6 py-7"
        >
          <div className="rounded-xl bg-orange-500 p-2.5 shadow-lg shadow-orange-500/20">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-black tracking-tight">
            Campus<span className="text-orange-400">Share.</span>
          </span>
        </Link>

        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map(({ label, path, icon: Icon, badge }) => {
              const active = path === "/dashboard";

              return (
                <Link
                  key={path}
                  to={path}
                  onClick={closeSidebar}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    {label}
                  </span>

                  {badge > 0 && (
                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${
                      active ? "bg-white text-orange-600" : "bg-orange-500 text-white"
                    }`}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2 text-orange-400">
              <Sparkles size={17} />
              <span className="text-xs font-bold">Campus community</span>
            </div>
            <p className="text-sm font-semibold text-white">
              Share more. Waste less.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Make useful resources accessible to everyone.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:ml-[265px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                CampusShare / Workspace
              </p>
              <p className="text-sm font-bold text-slate-800">
                Student Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 pr-3 transition hover:border-orange-300"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-600">
                {initials}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-bold text-slate-700 sm:block">
                {user?.name || "My Account"}
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Welcome banner */}
          <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#111a32] via-[#202543] to-[#39233b] p-7 shadow-xl shadow-slate-900/10 sm:p-10">
            <div className="absolute -right-16 -top-32 h-80 w-80 rounded-full border-[45px] border-orange-400/10" />
            <div className="absolute -bottom-36 right-40 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-bold text-orange-300">
                  <Sparkles size={14} /> Your campus community
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Hey, {firstName}! <span className="text-orange-400">👋</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Discover useful resources, connect with fellow students,
                  and make sharing a part of campus life.
                </p>
              </div>

              <Link
                to="/create-resource"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                <Plus size={19} /> Share a resource
              </Link>
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Resources",
                value: resources.length,
                icon: BookOpen,
                color: "bg-blue-50 text-blue-600",
                note: "Listed on campus",
              },
              {
                label: "Available",
                value: availableCount,
                icon: CheckCircle2,
                color: "bg-green-50 text-green-600",
                note: "Ready to borrow",
              },
              {
                label: "Borrowed",
                value: borrowedCount,
                icon: Clock,
                color: "bg-orange-50 text-orange-600",
                note: "Currently borrowed",
              },
              {
                label: "My Listings",
                value: myResources.length,
                icon: Package,
                color: "bg-purple-50 text-purple-600",
                note: "Resources you shared",
              },
            ].map(({ label, value, icon: Icon, color, note }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                      {value}
                    </p>
                  </div>
                  <div className={`rounded-2xl p-3.5 ${color}`}>
                    <Icon size={23} />
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-slate-400">{note}</p>
              </div>
            ))}
          </section>

          {/* Resources heading and request notice */}
          <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
                Explore
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                Campus Resources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Find something useful from your campus community.
              </p>
            </div>

            {pendingRequests > 0 && (
              <Link
                to="/incoming-requests"
                className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
              >
                <Inbox size={18} />
                {pendingRequests} pending request{pendingRequests !== 1 ? "s" : ""}
                <ArrowUpRight size={16} />
              </Link>
            )}
          </section>

          {/* Search and filters */}
          <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />
                <input
                  type="text"
                  placeholder="Search books, electronics, notes..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <SlidersHorizontal size={15} /> Category
                </span>
                {categoriesList.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-3.5 py-2.5 text-xs font-bold transition ${
                      selectedCategory === category
                        ? "bg-[#111a32] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchResources(true)}
                disabled={refreshing}
                aria-label="Refresh resources"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
              >
                <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </section>

          {/* Results count */}
          {!loading && !error && (
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Showing <span className="text-slate-900">{filteredResources.length}</span> resource{filteredResources.length !== 1 ? "s" : ""}
              </p>
              {(search || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="h-48 bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="h-6 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-10 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
              <p className="font-bold text-red-600">{error}</p>
              <button
                onClick={() => fetchResources()}
                className="mt-4 rounded-xl bg-[#111a32] px-5 py-3 text-sm font-bold text-white hover:bg-orange-500"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredResources.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <BookOpen size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                No resources found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search || selectedCategory !== "All"
                  ? "Try changing your search or category filter."
                  : "There are no resources yet. Be the first to share something with your campus."}
              </p>
              {search || selectedCategory !== "All" ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-5 font-bold text-orange-600 hover:text-orange-700"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/create-resource"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <Plus size={17} /> Share first resource
                </Link>
              )}
            </div>
          )}

          {/* Resource cards */}
          {!loading && !error && filteredResources.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => {
                const status = resource.status || "Available";

                const statusStyle =
                  status === "Available"
                    ? "bg-green-50 text-green-700"
                    : status === "Borrowed"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-red-50 text-red-700";

                return (
                  <article
                    key={resource.id}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        📚
                      </div>

                      {resource.image_id && (
                        <img
                          src={`${API_URL}/images/${resource.image_id}`}
                          alt={resource.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      <div className="absolute left-4 top-4">
                        <span className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm backdrop-blur">
                          {resource.category || "Other"}
                        </span>
                      </div>

                      <div className="absolute right-4 top-4">
                        <span className={`rounded-lg px-3 py-1.5 text-xs font-extrabold shadow-sm ${statusStyle}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-lg font-black text-slate-900 transition group-hover:text-orange-600">
                          {resource.title}
                        </h3>
                      </div>

                      <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {resource.description || "No description provided."}
                      </p>

                      <div className="space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Condition</span>
                          <span className="font-semibold text-slate-700">
                            {resource.condition || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Type</span>
                          <span className="font-semibold text-slate-700">
                            {resource.resource_type || "Borrow"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Shared by</span>
                          <span className="max-w-[150px] truncate font-semibold text-slate-700">
                            {resource.owner_name || "Campus student"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="text-xl font-black text-slate-900">
                          {Number(resource.price) === 0
                            ? "Free"
                            : `₹${resource.price}`}
                        </p>

                        <Link
                          to={`/resources/${resource.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#111a32] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-orange-500"
                        >
                          View details <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            CampusShare · Built for students, powered by sharing.
          </footer>
        </main>
      </div>
    </div>
  );
}
