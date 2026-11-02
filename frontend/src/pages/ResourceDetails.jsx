
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  User,
  IndianRupee,
  Send,
} from "lucide-react";

function ResourceDetails() {
  const { id } = useParams();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8001/resources/${id}`
        );

        setResource(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load resource details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleRequest = async () => {
    try {
      setRequesting(true);
      setMessage("");

      const response = await axios.post(
        `http://127.0.0.1:8001/resources/${id}/request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(response.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Could not submit your request."
      );
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading resource...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!resource) return null;

  const isOwner = currentUser?.id === resource.owner_id;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-blue-600 mb-8"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border p-8">

          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            <BookOpen size={32} className="text-blue-600" />
          </div>

          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {resource.category}
          </span>

          <h1 className="text-3xl font-bold text-slate-900 mt-5">
            {resource.title}
          </h1>

          <p className="text-slate-600 leading-7 mt-4">
            {resource.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-8">

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Price</p>
              <p className="font-bold text-xl flex items-center mt-2">
                <IndianRupee size={18} />
                {resource.price}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Condition</p>
              <p className="font-bold mt-2">{resource.condition}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Resource Type</p>
              <p className="font-bold mt-2">{resource.resource_type}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Shared By</p>
              <p className="font-bold flex items-center gap-2 mt-2">
                <User size={18} />
                {resource.owner_name}
              </p>
            </div>

          </div>

          {message && (
            <div className="mt-6 bg-blue-50 text-blue-700 p-4 rounded-xl">
              {message}
            </div>
          )}

          {!isOwner && resource.resource_type === "Borrow" && (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {requesting ? "Sending Request..." : "Request to Borrow"}
            </button>
          )}

          {isOwner && (
            <p className="mt-8 text-center text-slate-500">
              This is your resource.
            </p>
          )}

          {resource.resource_type !== "Borrow" && !isOwner && (
            <p className="mt-8 text-center text-slate-500">
              This resource is not available for borrowing.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResourceDetails;
