
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, BookOpen, CheckCircle, Clock, RotateCcw,
  User, ShieldCheck, Tag, Package
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [resource, setResource] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  let currentUser = {};
  try {
    currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
      localStorage.getItem("user") || "{}"
    );
  } catch {
    currentUser = {};
  }

  const userId = String(currentUser?.id || currentUser?._id || "");
  const ownerId = String(resource?.owner_id || "");
  const isOwner = Boolean(userId && ownerId && userId === ownerId);
  const status = resource?.status || "Available";
  const isAvailable = status === "Available";

  const myResourceRequests = myRequests
    .filter((request) => String(request.resource_id) === String(id))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const latestRequest = myResourceRequests[0];
  const requestStatus = latestRequest?.status;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const resourceResponse = await axios.get(`${API_URL}/resources/${id}`);
      setResource(resourceResponse.data);

      if (token) {
        const requestsResponse = await axios.get(`${API_URL}/resources/requests/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
      } else {
        setMyRequests([]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load resource details.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBorrow = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_URL}/resources/${id}/request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Borrow request submitted successfully!");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit borrow request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnRequest = async () => {
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_URL}/resources/${id}/return-request`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Return request submitted. Waiting for owner confirmation.");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit return request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] text-slate-500">Loading resource...</div>;
  }

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f6fa] p-6 text-center">
        <p className="text-red-600">{error || "Resource not found."}</p>
        <Link to="/dashboard" className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Back to Dashboard</Link>
      </div>
    );
  }

  const canBorrowAgain =
    !isOwner &&
    resource.resource_type === "Borrow" &&
    isAvailable &&
    (!requestStatus || ["Rejected", "Returned"].includes(requestStatus));

  const statusStyle = isAvailable
    ? "bg-green-50 text-green-700"
    : "bg-orange-50 text-orange-700";

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white"><BookOpen size={23} /></div>
            <span className="text-xl font-black text-slate-900">Campus<span className="text-orange-500">Share.</span></span>
          </Link>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600"><ArrowLeft size={17} /> Back</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#111a32] to-[#39233b]">
            {resource.image_id ? (
              <img
                src={`${API_URL}/images/${resource.image_id}`}
                alt={resource.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            ) : (
              <BookOpen size={85} className="text-orange-300/80" />
            )}
          </div>

          <div className="p-6 sm:p-9">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">{resource.category}</span>
              <span className={`rounded-full px-3 py-2 text-xs font-bold ${statusStyle}`}>{status}</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{resource.resource_type}</span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{resource.title}</h1>
                <p className="mt-4 max-w-3xl leading-7 text-slate-500">{resource.description}</p>
              </div>
              <p className="text-2xl font-black text-slate-900">{Number(resource.price) === 0 ? "Free" : `₹${resource.price}`}</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                [User, "Owner", resource.owner_name || "Campus student"],
                [Package, "Condition", resource.condition || "Not specified"],
                [Tag, "Resource type", resource.resource_type || "Borrow"],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600"><Icon size={21} /></div>
                  <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>
                </div>
              ))}
            </div>

            {message && <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">{message}</div>}
            {error && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <div className="mt-8 border-t border-slate-100 pt-6">
              {isOwner && (
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
                  <ShieldCheck size={20} /> This is your resource listing.
                </div>
              )}

              {!isOwner && canBorrowAgain && (
                <button onClick={handleBorrow} disabled={actionLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-extrabold text-white transition hover:bg-orange-600 disabled:opacity-50 sm:w-auto">
                  <BookOpen size={19} />
                  {actionLoading ? "Processing..." : requestStatus === "Returned" ? "Borrow Again" : requestStatus === "Rejected" ? "Request Again" : "Request to Borrow"}
                </button>
              )}

              {!isOwner && requestStatus === "Pending" && (
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700"><Clock size={19} /> Your borrow request is waiting for owner approval.</div>
              )}

              {!isOwner && requestStatus === "Rejected" && !isAvailable && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Your previous request was rejected. This resource is currently unavailable.</div>
              )}

              {!isOwner && requestStatus === "Accepted" && (
                <div>
                  <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">Your borrow request was accepted.</div>
                  {status === "Borrowed" && (
                    <button onClick={handleReturnRequest} disabled={actionLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111a32] px-6 py-4 font-bold text-white hover:bg-orange-500 disabled:opacity-50 sm:w-auto">
                      <RotateCcw size={18} /> {actionLoading ? "Processing..." : "Request Return"}
                    </button>
                  )}
                </div>
              )}

              {!isOwner && requestStatus === "ReturnRequested" && (
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700"><Clock size={19} /> Return requested. Waiting for owner confirmation.</div>
              )}

              {!isOwner && requestStatus === "Returned" && (
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700"><CheckCircle size={19} /> Resource returned successfully.</div>
              )}

              {!isOwner && !requestStatus && status === "Borrowed" && (
                <div className="rounded-xl bg-orange-50 p-4 text-sm text-orange-700">This resource is currently borrowed by another student.</div>
              )}

              {!isOwner && !token && (
                <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#111a32] px-6 py-4 font-bold text-white hover:bg-orange-500">Sign in to request this resource</Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResourceDetails;
