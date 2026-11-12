
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Package, Send, Inbox, Edit, Camera,
  Save, X, LogOut, ArrowLeft, BookOpen, RefreshCw
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

function readUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") || "{}"
    );
  } catch {
    return {};
  }
}

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(readUser);
  const [name, setName] = useState(readUser().name || "");
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState({
    listings: 0,
    sentRequests: 0,
    receivedRequests: 0,
  });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [listingsRes, sentRes, receivedRes] = await Promise.all([
          axios.get(`${API_URL}/resources/my`, { headers }),
          axios.get(`${API_URL}/resources/requests/my`, { headers }),
          axios.get(`${API_URL}/resources/requests/incoming`, { headers }),
        ]);

        setStats({
          listings: Array.isArray(listingsRes.data) ? listingsRes.data.length : 0,
          sentRequests: Array.isArray(sentRes.data) ? sentRes.data.length : 0,
          receivedRequests: Array.isArray(receivedRes.data) ? receivedRes.data.length : 0,
        });
      } catch (err) {
        console.error("Profile statistics error:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [navigate, token]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Please select an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const image = reader.result;
        localStorage.setItem("profileImage", image);
        setProfileImage(image);
        setError("");
        setSuccess("Profile picture updated on this device.");
      } catch {
        setError("Could not save this image. Please choose a smaller file.");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2 || name.trim().length > 50) {
      setError("Name must contain between 2 and 50 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${API_URL}/auth/profile`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = {
        ...user,
        ...response.data,
        name: response.data.name || name.trim(),
      };

      setUser(updatedUser);
      setName(updatedUser.name);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setIsEditing(false);
      setSuccess("Your profile was updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setIsEditing(false);
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    navigate("/login", { replace: true });
  };

  const initials = (user.name || "Student")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8">
        <section className="mb-8 rounded-[28px] bg-gradient-to-r from-[#111a32] to-[#39233b] p-8 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Account settings</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">My Profile</h1>
          <p className="mt-2 text-sm text-slate-300">Manage your personal information and campus activity.</p>
        </section>

        {(error || success) && (
          <div className={`mb-6 rounded-xl border p-4 text-sm ${error ? "border-red-100 bg-red-50 text-red-700" : "border-green-100 bg-green-50 text-green-700"}`}>
            {error || success}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 sm:p-9">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-28 w-28 rounded-full border-4 border-orange-100 object-cover" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-100 bg-[#111a32] text-3xl font-black text-orange-400">
                    {initials}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-orange-500 p-2.5 text-white shadow-lg transition hover:bg-orange-600" title="Change profile photo">
                  <Camera size={17} />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black text-slate-900">{user.name || "CampusShare Student"}</h2>
                <p className="mt-1 break-all text-sm text-slate-500">{user.email || "No email available"}</p>
                <p className="mt-3 text-xs font-medium text-slate-400">Profile photo is saved in this browser · Maximum 1 MB</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
                <p className="mt-1 text-sm text-slate-500">Your CampusShare account details.</p>
              </div>
              {!isEditing && (
                <button onClick={() => { setIsEditing(true); setError(""); setSuccess(""); }} className="flex items-center gap-2 rounded-xl bg-[#111a32] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500">
                  <Edit size={16} /> Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600"><User size={22} /></div>
                  <div><p className="text-xs text-slate-400">Full Name</p><p className="mt-1 font-bold text-slate-800">{user.name || "Not available"}</p></div>
                </div>
                <div className="flex min-w-0 items-center gap-4 rounded-2xl bg-slate-50 p-5">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Mail size={22} /></div>
                  <div className="min-w-0"><p className="text-xs text-slate-400">Email Address</p><p className="mt-1 break-all font-bold text-slate-800">{user.email || "Not available"}</p></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Full Name</label>
                  <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={50} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Email Address</label>
                  <input type="email" value={user.email || ""} readOnly className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm text-slate-500 outline-none" />
                  <p className="mt-2 text-xs text-slate-400">Email cannot be changed here because it is linked to your verified account.</p>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button type="button" onClick={handleCancel} disabled={loading} className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                    <span className="inline-flex items-center gap-2"><X size={17} /> Cancel</span>
                  </button>
                  <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-extrabold text-white hover:bg-orange-600 disabled:opacity-50">
                    {loading ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="mb-5 text-xl font-black text-slate-900">My CampusShare Activity</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [Package, "My Listings", stats.listings, "bg-blue-50 text-blue-600"],
                  [Send, "Requests Sent", stats.sentRequests, "bg-green-50 text-green-600"],
                  [Inbox, "Incoming Requests", stats.receivedRequests, "bg-purple-50 text-purple-600"],
                ].map(([Icon, label, value, style]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${style}`}><Icon size={23} /></div>
                    <p className="text-3xl font-black text-slate-900">{statsLoading ? "—" : value}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 border-t border-slate-100 pt-7">
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;
