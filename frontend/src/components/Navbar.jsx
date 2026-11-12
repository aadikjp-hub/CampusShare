
import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 gap-4">

          {/* Logo */}
          <a
            href="#home"
            onClick={closeMenu}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Package size={24} />
            </div>

            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              Campus<span className="text-blue-600">Share</span>
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-slate-600 font-medium">
            <a href="#home" className="hover:text-blue-600 transition">
              Home
            </a>

            <a href="#resources" className="hover:text-blue-600 transition">
              Resources
            </a>

            <a href="#how" className="hover:text-blue-600 transition">
              How It Works
            </a>
          </div>

          {/* Desktop authentication */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-5">
          <div className="flex flex-col gap-4">
            <a
              href="#home"
              onClick={closeMenu}
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Home
            </a>

            <a
              href="#resources"
              onClick={closeMenu}
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              Resources
            </a>

            <a
              href="#how"
              onClick={closeMenu}
              className="text-slate-700 hover:text-blue-600 font-medium"
            >
              How It Works
            </a>

            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-center border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className="text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
