
import { useState } from "react";
import { Package, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <Package size={24} />
          </div>

          <span className="text-2xl font-bold text-slate-900">
            Campus<span className="text-blue-600">Share</span>
          </span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <a href="#home" className="hover:text-blue-600">Home</a>
          <a href="#resources" className="hover:text-blue-600">Resources</a>
          <a href="#how" className="hover:text-blue-600">How It Works</a>
        </div>

        {/* Authentication buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-5 py-2 font-semibold text-slate-700">
            Login
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            Sign Up
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-5">
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#resources" onClick={() => setMenuOpen(false)}>Resources</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>

          <button className="bg-blue-600 text-white p-3 rounded-lg">
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
