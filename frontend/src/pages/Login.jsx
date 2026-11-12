
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, BookOpen, Eye, EyeOff,
  CheckCircle2, ShieldCheck, GraduationCap, Users, Sparkles
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError("");
    if (event.target.name === "email") setNeedsVerification(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNeedsVerification(false);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Login failed. Please check your credentials.");

      if (
        err.response?.status === 403 &&
        detail?.toLowerCase().includes("verify")
      ) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setError("");
    setSendingOTP(true);

    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not send OTP. Try again.");
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080d1b] lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#111a32] via-[#10182b] to-[#25152b] px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

        <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
          <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/30">
            <BookOpen size={27} />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Campus<span className="text-orange-400">Share.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
            <Sparkles size={14} /> Built for campus life
          </div>

          <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-white xl:text-6xl">
            Your campus has
            <br />
            more to <span className="text-orange-400">share.</span>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-slate-300">
            One student community. Countless useful resources. Find what you
            need, lend what you can, and make student life easier.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <Users className="mb-4 text-orange-400" size={25} />
              <p className="font-bold text-white">Student community</p>
              <p className="mt-1 text-sm text-slate-400">Connect and collaborate</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <GraduationCap className="mb-4 text-orange-400" size={25} />
              <p className="font-bold text-white">Smart sharing</p>
              <p className="mt-1 text-sm text-slate-400">Borrow, lend and return</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs tracking-wide text-slate-500">
          SHARE MORE. WASTE LESS. GROW TOGETHER.
        </p>
      </section>

      {/* Login panel */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6fa] px-5 py-12 sm:px-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          <Link to="/" className="mb-9 flex items-center justify-center gap-3 lg:hidden">
            <div className="rounded-xl bg-orange-500 p-2.5 text-white">
              <BookOpen size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Campus<span className="text-orange-500">Share.</span>
            </span>
          </Link>

          <div className="rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Lock size={23} />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-600">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pick up where you left off. Your campus community is waiting.
              </p>
            </div>

            {location.state?.verified && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 size={18} /> Email verified! You can now sign in.
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email address
                </label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-orange-500" size={19} />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-orange-500" size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500">
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111a32] py-4 text-sm font-extrabold text-white shadow-lg shadow-slate-900/15 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {needsVerification && (
              <button type="button" onClick={handleVerifyEmail} disabled={sendingOTP} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-3.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-60">
                <ShieldCheck size={18} />
                {sendingOTP ? "Sending OTP..." : "Verify your email"}
              </button>
            )}

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-medium text-slate-400">NEW TO CAMPUSSHARE?</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-extrabold text-orange-600 hover:text-orange-700">
                Create account
              </Link>
            </p>
          </div>

          <Link to="/" className="mt-7 block text-center text-sm font-semibold text-slate-500 transition hover:text-orange-600">
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
