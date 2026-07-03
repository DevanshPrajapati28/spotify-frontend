import { Home, Search, Library, Plus, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMusicStore } from "../store/useMusicStore";
import clsx from "clsx";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { songs } = useMusicStore();
  const likedSongsCount = songs.filter(s => s.liked).length;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
  ];

  return (
    <aside className="w-[300px] flex flex-col gap-2 h-full">
      {/* Top Nav Block */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={clsx(
              "flex items-center gap-4 text-sm font-semibold transition-colors duration-200",
              pathname === item.href
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <item.icon className="w-6 h-6" />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Library Block */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
          <div className="flex items-center gap-3 font-semibold text-sm">
            <Library className="w-6 h-6" />
            Your Library
          </div>
          <button className="hover:bg-zinc-800 rounded-full p-1.5 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Library Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {/* Liked Songs */}
          <Link
            to="/liked"
            className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-md group transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">Liked Songs</span>
              <span className="text-sm text-zinc-400">Playlist • {likedSongsCount} {likedSongsCount === 1 ? 'song' : 'songs'}</span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
