
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen, MailCheck, ArrowRight, RefreshCw,
  ShieldCheck, CheckCircle2, Sparkles
} from "lucide-react";

const API_URL = "http://127.0.0.1:8001";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete six-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });

      navigate("/login", {
        replace: true,
        state: { verified: true, email },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      setMessage(response.data.message || "A new OTP has been sent to your email.");
      setOtp("");
      setCountdown(60);
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d1b] px-4 py-12">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        <Link to="/" className="mb-9 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/30">
            <BookOpen size={27} />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Campus<span className="text-orange-400">Share.</span>
          </span>
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white p-7 shadow-2xl shadow-black/30 sm:p-10">
          <div className="mb-7 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
              <MailCheck size={39} />
              <div className="absolute -right-2 -top-2 rounded-full border-4 border-white bg-green-500 p-1 text-white">
                <ShieldCheck size={15} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Sparkles size={13} /> One last step
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Verify your email
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              We've sent a six-digit verification code to your inbox.
            </p>
            <p className="mt-2 break-all font-bold text-slate-800">{email}</p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 size={17} /> {message}
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-8 space-y-6">
            <div>
              <label className="mb-3 block text-center text-sm font-bold text-slate-700">
                Enter your verification code
              </label>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="000000"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-5 text-center text-3xl font-black tracking-[0.6em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
              <p className="mt-2 text-center text-xs text-slate-400">
                The code expires after 5 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111a32] py-4 text-sm font-extrabold text-white shadow-lg shadow-slate-900/15 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify and continue"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 transition hover:text-orange-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
              {resending
                ? "Sending new code..."
                : countdown > 0
                ? `Resend code in ${countdown}s`
                : "Resend verification code"}
            </button>
          </div>
        </div>

        <Link
          to="/signup"
          className="mt-7 block text-center text-sm font-semibold text-slate-400 transition hover:text-orange-400"
        >
          ← Back to sign up
        </Link>
      </div>
    </main>
  );
}
