
import { Search, Users, Package, Handshake } from "lucide-react";
import { useState } from "react";

export default function Hero({ onSearch }) {
  const [search, setSearch] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    onSearch(search);

    document.getElementById("resources")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  return (
    <section id="home" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">

        <div>
          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            YOUR CAMPUS. YOUR COMMUNITY.
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
            Share More.
            <br />
            <span className="text-blue-600">Spend Less.</span>
          </h1>

          <p className="text-slate-500 text-lg mt-6 leading-8">
            Why buy something you only need temporarily?
            Borrow, lend and share resources with students
            in your college community.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex bg-slate-100 p-2 rounded-xl max-w-lg"
          >
            <Search className="text-slate-400 mt-2 ml-2" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, calculators..."
              className="bg-transparent flex-1 px-3 outline-none min-w-0"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <div className="flex gap-8 mt-10">
            <div>
              <Users className="text-blue-600 mb-2" />
              <h3 className="font-bold text-xl">Students</h3>
              <p className="text-sm text-slate-500">Community sharing</p>
            </div>

            <div>
              <Package className="text-blue-600 mb-2" />
              <h3 className="font-bold text-xl">Resources</h3>
              <p className="text-sm text-slate-500">Available items</p>
            </div>

            <div>
              <Handshake className="text-blue-600 mb-2" />
              <h3 className="font-bold text-xl">Sharing</h3>
              <p className="text-sm text-slate-500">Borrow and lend</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000"
            alt="Students studying together"
            className="w-full h-[430px] object-cover rounded-3xl shadow-xl"
          />

          <div className="absolute bottom-6 left-[-15px] bg-white p-5 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-700 p-3 rounded-full">
                <Handshake />
              </div>

              <div>
                <h3 className="font-bold">Share with confidence</h3>
                <p className="text-sm text-slate-500">
                  Your campus community
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
