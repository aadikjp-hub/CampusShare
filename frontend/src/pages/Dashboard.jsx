
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  PlusCircle,
  LogOut,
  RefreshCw,
  Eye,
  User,
  ClipboardList,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch all available resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8001/resources/"
      );

      setResources(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not load resources."
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

    fetchResources();
  }, [navigate]);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b p-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          CampusShare
        </h1>

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/my-listings")}
            className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold"
          >
            <ClipboardList size={18} />
            My Listings
          </button>

          <span className="text-slate-600 hidden sm:block">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Welcome Section */}
        <div className="flex flex-wrap justify-between items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, {user?.name || "Student"}! 👋
            </h1>

            <p className="text-slate-500 mt-2">
              Explore resources shared by your campus community.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-resource")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            <PlusCircle size={20} />
            Share a Resource
          </button>

        </div>

        {/* Resources Heading */}
        <div className="flex justify-between items-center mt-12 mb-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Available Resources
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Find books, notes, electronics and more.
            </p>
          </div>

          <button
            onClick={fetchResources}
            disabled={loading}
            className="flex items-center gap-2 text-blue-600 font-semibold"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <p className="text-blue-600 text-center py-10">
            Loading resources...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded-xl">
            {error}
          </p>
        )}

        {/* Empty State */}
        {!loading && !error && resources.length === 0 && (
          <div className="bg-white border rounded-2xl p-10 text-center">

            <BookOpen
              size={40}
              className="mx-auto text-slate-400"
            />

            <h3 className="text-xl font-bold mt-4">
              No resources yet
            </h3>

            <p className="text-slate-500 mt-2">
              Be the first student to share a resource!
            </p>

            <button
              onClick={() => navigate("/create-resource")}
              className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl"
            >
              Share Your First Resource
            </button>

          </div>
        )}

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {resources.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-lg transition"
            >

              <BookOpen
                className="text-blue-600 mb-4"
                size={28}
              />

              <h3 className="text-xl font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="text-slate-500 mt-2 line-clamp-3">
                {item.description}
              </p>

              {/* Resource Information */}
              <div className="mt-4 space-y-2 text-sm text-slate-600">

                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {item.category}
                </p>

                <p>
                  <span className="font-semibold">Condition:</span>{" "}
                  {item.condition}
                </p>

                <p>
                  <span className="font-semibold">Type:</span>{" "}
                  {item.resource_type}
                </p>

                <p>
                  <span className="font-semibold">Price:</span>{" "}
                  ₹{item.price}
                </p>

                <p className="flex items-center gap-2">
                  <User size={15} />
                  <span>Owner: {item.owner_name}</span>
                </p>

              </div>

              {/* View Details Button */}
              <button
                onClick={() => navigate(`/resource/${item.id}`)}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <Eye size={18} />
                View Details
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
