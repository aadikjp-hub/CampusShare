
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, X, RefreshCw, Inbox, RotateCcw,
  Clock, CheckCircle, XCircle, Package
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

function IncomingRequests() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("All");

  const fetchRequests = useCallback(async (refresh = false) => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    refresh ? setRefreshing(true) : setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/resources/requests/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to load incoming requests.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (requestId, status) => {
    if (!requestId || updatingId) return;

    try {
      setUpdatingId(requestId);
      setMessage("");

      const response = await axios.put(
        `${API_URL}/resources/requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setMessage(response.data?.message || `Request ${status.toLowerCase()} successfully.`);
      setMessageType("success");
      await fetchRequests(true);
    } catch (err) {
      setMessage(err.response?.data?.detail || err.response?.data?.message || "Failed to update request.");
      setMessageType("error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = filter === "All"
    ? requests
    : requests.filter((request) => request.status === filter);

  const pendingCount = requests.filter((request) => request.status === "Pending").length;
  const returnCount = requests.filter((request) => request.status === "ReturnRequested").length;

  const statusStyle = (status) => ({
    Pending: "bg-amber-50 text-amber-700",
    Accepted: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
    ReturnRequested: "bg-blue-50 text-blue-700",
    Returned: "bg-purple-50 text-purple-700",
  }[status] || "bg-slate-100 text-slate-600");

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white"><Inbox size={23} /></div>
            <span className="text-xl font-black text-slate-900">Campus<span className="text-orange-500">Share.</span></span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600"><ArrowLeft size={17} /> Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
        <section className="mb-8 rounded-[28px] bg-gradient-to-r from-[#111a32] to-[#39233b] p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Owner workspace</p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">Incoming Requests</h1>
              <p className="mt-2 text-sm text-slate-300">Review borrowing requests and confirm returned resources.</p>
            </div>
            <button onClick={() => fetchRequests(true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20 disabled:opacity-50">
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </section>

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["Total Requests", requests.length, Package, "bg-blue-50 text-blue-600"],
            ["Awaiting Response", pendingCount, Clock, "bg-amber-50 text-amber-600"],
            ["Return Requests", returnCount, RotateCcw, "bg-orange-50 text-orange-600"],
          ].map(([label, value, Icon, style]) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-900">{value}</p></div>
                <div className={`rounded-2xl p-3 ${style}`}><Icon size={23} /></div>
              </div>
            </div>
          ))}
        </section>

        {message && (
          <div className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm ${messageType === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"}`}>
            {messageType === "error" ? <XCircle size={18} /> : <CheckCircle size={18} />}
            {message}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          {["All", "Pending", "Accepted", "Rejected", "ReturnRequested", "Returned"].map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${filter === status ? "bg-[#111a32] text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"}`}>
              {status === "ReturnRequested" ? "Return Requested" : status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Loading incoming requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Inbox className="mx-auto mb-4 text-orange-500" size={42} />
            <h2 className="text-xl font-black text-slate-900">No requests found</h2>
            <p className="mt-2 text-sm text-slate-500">Requests for your shared resources will appear here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRequests.map((request) => (
              <article key={request.id || request._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-orange-50 p-3 text-orange-600"><BookOpen size={24} /></div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">{request.resource_title || "Resource"}</h2>
                      <p className="mt-2 text-sm text-slate-500">Requested by <span className="font-bold text-slate-800">{request.requester_name || "Student"}</span></p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-xs font-bold ${statusStyle(request.status)}`}>
                    {request.status === "ReturnRequested" ? "Return Requested" : request.status}
                  </span>
                </div>

                {request.status === "Pending" && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <button onClick={() => updateStatus(request.id || request._id, "Accepted")} disabled={updatingId !== null} className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                      <Check size={17} /> {updatingId === (request.id || request._id) ? "Processing..." : "Accept"}
                    </button>
                    <button onClick={() => updateStatus(request.id || request._id, "Rejected")} disabled={updatingId !== null} className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50">
                      <X size={17} /> Reject
                    </button>
                  </div>
                )}

                {request.status === "ReturnRequested" && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">The borrower has requested to return this resource. Confirm once you have received it.</p>
                    <button onClick={() => updateStatus(request.id || request._id, "Returned")} disabled={updatingId !== null} className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                      <RotateCcw size={17} /> {updatingId === (request.id || request._id) ? "Processing..." : "Confirm Return"}
                    </button>
                  </div>
                )}

                {request.status === "Accepted" && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">Request accepted. The resource is currently marked as borrowed.</p>}
                {request.status === "Rejected" && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">This request was rejected.</p>}
                {request.status === "Returned" && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">Resource returned and marked as available.</p>}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default IncomingRequests;
