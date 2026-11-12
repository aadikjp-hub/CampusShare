
import { Navigate, Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function VerifyOTP() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d1b] px-4 py-12">

      {/* Background effects */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <Link
          to="/"
          className="mb-9 flex items-center justify-center gap-3"
        >
          <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-500/30">
            <BookOpen size={27} />
          </div>

          <span className="text-2xl font-black tracking-tight text-white">
            Campus<span className="text-orange-400">Share.</span>
          </span>
        </Link>

        {/* Main card */}
        <div className="rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl shadow-black/30 sm:p-10">

          {/* Success icon */}
          <div className="mb-7 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">
              <ShieldCheck size={42} />

              <div className="absolute -right-2 -top-2 rounded-full border-4 border-white bg-green-500 p-1 text-white">
                <CheckCircle2 size={16} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700">
            <CheckCircle2 size={14} />
            OTP verification disabled
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Email verification is not required
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            CampusShare currently uses direct account registration
            for the college demonstration. You can create your account
            and sign in without entering an OTP.
          </p>

          {/* Information */}
          <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-orange-500"
              />

              <div>
                <p className="font-bold text-slate-800">
                  Ready to join CampusShare?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Go to the signup page to create your account directly.
                  Your password will still be securely hashed.
                </p>
              </div>
            </div>
          </div>

          {/* Signup button */}
          <Link
            to="/signup"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#111a32] py-4 text-sm font-extrabold text-white shadow-lg shadow-slate-900/15 transition hover:bg-orange-500"
          >
            Go to Sign Up
            <ArrowRight size={18} />
          </Link>

          {/* Login link */}
          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-extrabold text-orange-600 hover:text-orange-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <Link
          to="/"
          className="mt-7 block text-center text-sm font-semibold text-slate-400 transition hover:text-orange-400"
        >
          ← Back to home
        </Link>

      </div>
    </main>
  );
}
