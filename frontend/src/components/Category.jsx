
import {
  BookOpen,
  Laptop,
  Calculator,
  Dumbbell,
  Pencil,
  Headphones
} from "lucide-react";

const categories = [
  { name: "Books", icon: BookOpen },
  { name: "Electronics", icon: Laptop },
  { name: "Calculators", icon: Calculator },
  { name: "Sports", icon: Dumbbell },
  { name: "Stationery", icon: Pencil },
  { name: "Accessories", icon: Headphones }
];

export default function Category({ onSelect }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">

      <div className="mb-10">
        <p className="text-blue-600 font-bold text-sm">EXPLORE</p>
        <h2 className="text-3xl font-bold mt-2">
          Browse Categories
        </h2>
        <p className="text-slate-500 mt-2">
          Find everything you need around your campus.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              onClick={() => onSelect(category.name)}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition"
            >
              <Icon className="mx-auto text-blue-600" size={32} />

              <h3 className="font-semibold mt-4">
                {category.name}
              </h3>
            </button>
          );
        })}

      </div>
    </section>
  );
}
