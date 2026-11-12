
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, BookOpen, RefreshCw, Clock, CheckCircle,
  XCircle, RotateCcw, Search, ArrowUpRight
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const statusOptions = ["All", "Pending", "Accepted", "Rejected", "ReturnRequested", "Returned"];

function MyRequests() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchRequests = useCallback(async (refresh = false) => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/resources/requests/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load your requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusLabel = (status) => ({
    accepted: "Accepted",
    rejected: "Rejected",
    returnrequested: "Return Requested",
    returned: "Returned",
    pending: "Pending",
  }[status?.toLowerCase()] || "Pending");

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "returned":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      case "returnrequested":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "returned":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      case "returnrequested":
        return <RotateCcw size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const text = search.toLowerCase().trim();
    const matchesSearch =
      request.resource_title?.toLowerCase().includes(text) ||
      request.owner_name?.toLowerCase().includes(text);
    const matchesStatus =
      selectedStatus === "All" ||
      request.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [requests, search, selectedStatus]);

  const count = (status) =>
    requests.filter((request) => request.status?.toLowerCase() === status.toLowerCase()).length;

  const messages = {
    pending: "Waiting for the resource owner to respond.",
    accepted: "Your request was accepted. You can request a return when finished.",
    rejected: "The resource owner rejected your request.",
    returnrequested: "Return requested. Waiting for owner confirmation.",
    returned: "The owner confirmed that the resource was returned.",
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white"><BookOpen size={23} /></div>
            <span className="text-xl font-black text-slate-900">Campus<span className="text-orange-500">Share.</span></span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600">
            <ArrowLeft size={17} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
        <section className="mb-8 rounded-[28px] bg-gradient-to-r from-[#111a32] to-[#39233b] p-8 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Borrowing activity</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">My Requests</h1>
              <p className="mt-2 text-sm text-slate-300">Track every resource you've requested from your campus community.</p>
            </div>
            <button onClick={() => fetchRequests(true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20 disabled:opacity-50">
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </section>

        <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Total Requests", requests.length, "bg-blue-50 text-blue-600"],
            ["Pending", count("Pending"), "bg-amber-50 text-amber-600"],
            ["Accepted", count("Accepted"), "bg-green-50 text-green-600"],
            ["Returned", count("Returned"), "bg-purple-50 text-purple-600"],
          ].map(([label, value, style]) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
              <div className={`mt-3 inline-block rounded-lg px-2 py-1 text-xs font-bold ${style}`}>My activity</div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by resource or owner..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button key={status} onClick={() => setSelectedStatus(status)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${selectedStatus === status ? "bg-[#111a32] text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"}`}>
                {status === "ReturnRequested" ? "Return Requested" : status}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Loading your requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-orange-500" size={40} />
            <h2 className="text-xl font-black text-slate-900">{requests.length ? "No matching requests" : "No requests yet"}</h2>
            <p className="mt-2 text-sm text-slate-500">{requests.length ? "Try another filter or search term." : "Browse campus resources and request something you need."}</p>
            <Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Browse resources <ArrowUpRight size={16} /></Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request) => {
              const normalized = request.status?.toLowerCase() || "pending";
              return (
                <article key={request.id || request._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-xl bg-orange-50 p-3 text-orange-600"><BookOpen size={23} /></div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${getStatusStyle(request.status)}`}>
                      {getStatusIcon(request.status)} {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{request.resource_title || "Resource"}</h2>
                  <p className="mt-2 text-sm text-slate-500">Requested from</p>
                  <p className="font-bold text-slate-800">{request.owner_name || "Unknown"}</p>
                  <p className="mt-5 min-h-10 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600">{messages[normalized] || messages.pending}</p>
                  <p className="mt-4 text-xs text-slate-400">
                    Requested on: {request.created_at ? new Date(request.created_at).toLocaleDateString() : "Unknown"}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyRequests;
