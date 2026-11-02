
import { MapPin } from "lucide-react";

export default function ItemCard({ item }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition">

      <img
        src={item.image}
        alt={item.title}
        className="w-full h-52 object-cover"
      />

      <div className="p-5">

        <div className="flex justify-between items-center">
          <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold">
            {item.category}
          </span>

          <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs">
            {item.status}
          </span>
        </div>

        <h3 className="text-xl font-bold mt-4">
          {item.title}
        </h3>

        <p className="text-slate-500 text-sm mt-2">
          Owner: {item.owner}
        </p>

        <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
          <MapPin size={15} />
          {item.location}
        </p>

        <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">
          View Details
        </button>

      </div>
    </div>
  );
}
