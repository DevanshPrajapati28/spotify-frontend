import { X } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="w-[300px] bg-[#121212] rounded-lg h-full flex flex-col hidden lg:flex">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-base m-0">Queue</h2>
        <button className="text-zinc-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4">
        <div>
          <h3 className="text-white font-bold text-sm mb-3">Now playing</h3>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop"
                alt="Album cover"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-green-500 font-semibold text-sm truncate">Current Song</span>
              <span className="text-zinc-400 text-xs truncate">Artist Name</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm mb-3 mt-4">Next in queue</h3>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-white/10 p-2 -mx-2 rounded-md transition-colors">
                <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0"></div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-white text-sm truncate">Upcoming Song {i}</span>
                  <span className="text-zinc-400 text-xs truncate">Artist Name</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
