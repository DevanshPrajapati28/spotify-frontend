import { Search } from "lucide-react";

export default function SearchPage() {
  const genres = [
    { name: "Pop", color: "bg-pink-500" },
    { name: "Hip-Hop", color: "bg-orange-500" },
    { name: "Rock", color: "bg-red-500" },
    { name: "Jazz", color: "bg-blue-500" },
    { name: "Electronic", color: "bg-purple-500" },
    { name: "Classical", color: "bg-amber-700" },
    { name: "R&B", color: "bg-rose-500" },
    { name: "Country", color: "bg-yellow-600" },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="What do you want to play?"
          className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-full leading-5 bg-[#242424] text-white placeholder-zinc-400 hover:bg-[#2a2a2a] focus:outline-none focus:bg-[#2a2a2a] focus:border-white transition-colors sm:text-sm"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-bold text-white mb-6">Browse all</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {genres.map((genre) => (
            <div
              key={genre.name}
              className={`${genre.color} rounded-lg p-4 h-48 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <h3 className="text-white font-bold text-2xl">{genre.name}</h3>
              <div className="w-24 h-24 bg-black/20 rotate-[25deg] absolute -bottom-4 -right-4 rounded shadow-lg group-hover:shadow-xl transition-shadow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
