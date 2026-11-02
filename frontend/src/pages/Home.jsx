
import { Link } from "react-router-dom";
import {
  BookOpen,
  Laptop,
  Calculator,
  GraduationCap,
  ArrowRight,
  Share2,
  ShieldCheck,
  Users,
  Search,
} from "lucide-react";

function Home() {
  const categories = [
    { name: "Books & Notes", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "Electronics", icon: Laptop, color: "bg-purple-100 text-purple-600" },
    { name: "Calculators", icon: Calculator, color: "bg-orange-100 text-orange-600" },
    { name: "Study Materials", icon: GraduationCap, color: "bg-green-100 text-green-600" },
  ];

  const features = [
    {
      icon: Share2,
      title: "Share Resources",
      description: "Share your unused books and study materials with fellow students.",
    },
    {
      icon: ShieldCheck,
      title: "Student Community",
      description: "Connect with students and build a helpful campus community.",
    },
    {
      icon: Users,
      title: "Save Money",
      description: "Borrow and reuse resources instead of buying everything new.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <BookOpen size={25} />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Campus<span className="text-blue-600">Share</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 font-semibold text-slate-700 hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Your Campus. Your Community.
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Share More.
              <br />
              <span className="text-blue-600">Spend Less.</span>
            </h1>

            <p className="text-lg text-slate-500 mt-6 leading-relaxed max-w-lg">
              A smarter way for students to share, borrow and exchange
              educational resources within their campus community.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/signup"
                className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Join CampusShare <ArrowRight size={19} />
              </Link>

              <Link
                to="/login"
                className="border border-slate-300 text-slate-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-slate-100 transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <div className="bg-white/15 rounded-2xl p-6 mb-5">
              <Search size={42} />
              <h2 className="text-3xl font-bold mt-5">
                Everything Students Need
              </h2>
              <p className="text-blue-100 mt-3">
                Find useful resources, connect with classmates and make
                student life easier.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white text-slate-900 rounded-xl p-4">
                <BookOpen className="text-blue-600 mb-2" size={28} />
                <p className="font-bold">Books</p>
                <p className="text-sm text-slate-500">Share & borrow</p>
              </div>
              <div className="bg-white text-slate-900 rounded-xl p-4">
                <Laptop className="text-blue-600 mb-2" size={28} />
                <p className="font-bold">Electronics</p>
                <p className="text-sm text-slate-500">Reuse resources</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">
            Explore Categories
          </h2>
          <p className="text-slate-500 mt-3">
            Discover resources available for student life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg transition"
              >
                <div className={`inline-flex p-4 rounded-2xl ${category.color}`}>
                  <Icon size={30} />
                </div>
                <h3 className="font-semibold text-slate-800 mt-4">
                  {category.name}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              Why CampusShare?
            </h2>
            <p className="text-slate-500 mt-3">
              Making campus life affordable and collaborative.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="border border-slate-200 rounded-2xl p-7 hover:shadow-lg transition"
                >
                  <div className="inline-flex bg-blue-100 text-blue-600 p-3 rounded-xl">
                    <Icon size={27} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-5">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 mt-3 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold text-xl text-white">CampusShare</p>
          <p className="text-sm">
            © 2026 CampusShare. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
