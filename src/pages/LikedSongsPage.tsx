import { Play } from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import { useEffect } from "react";

export default function LikedSongsPage() {
  const { songs, fetchSongs, playSong } = useMusicStore();
  
  const likedSongs = songs.filter(s => s.liked);

  useEffect(() => {
    if (songs.length === 0) {
      fetchSongs();
    }
  }, [songs.length, fetchSongs]);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">
          Liked Songs
        </h2>
        
        {likedSongs.length === 0 ? (
          <div className="text-zinc-400">You haven't liked any songs yet. Discover some music and click the heart icon!</div>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {likedSongs.map((song) => (
              <div
                key={song._id}
                className="w-[180px] p-4 bg-[#181818] hover:bg-[#282828] rounded-md transition-colors cursor-pointer group flex flex-col gap-4"
                onClick={() => playSong(song)}
              >
                <div className="w-full aspect-square bg-zinc-800 rounded-md shadow-lg relative">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105 hover:bg-green-400">
                    <Play className="w-6 h-6 fill-black ml-1" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold truncate">
                    {song.title}
                  </span>
                  <span className="text-zinc-400 text-sm truncate mt-1">
                    {song.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
