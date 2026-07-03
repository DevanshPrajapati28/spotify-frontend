import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Mic2, ListMusic, MonitorSpeaker, Heart } from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function Player() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, toggleLike, songs, toggleShuffle, toggleRepeat, isShuffled, isRepeating } = useMusicStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      setVolume(percentage * 100);
      audioRef.current.volume = percentage;
    }
  };

  // Get the most up-to-date song data for the current song
  const activeSong = songs.find(s => s._id === currentSong?._id) || currentSong;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });
      audioRef.current.addEventListener('ended', () => {
        const state = useMusicStore.getState();
        if (state.isRepeating && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          state.nextSong();
        }
      });
    }
    
    if (activeSong && audioRef.current.src !== activeSong.audioUrl) {
      audioRef.current.src = activeSong.audioUrl;
    }
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [activeSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  if (!activeSong) return (
    <footer className="h-20 bg-black flex items-center justify-center px-4 mt-2 text-zinc-500 text-sm border-t border-zinc-800">
      Select a song to start playing
    </footer>
  );

  return (
    <footer className="h-20 bg-black flex items-center justify-between px-4 mt-2 border-t border-zinc-800">
      {/* Current Song Info */}
      <div className="w-[30%] min-w-[180px] flex items-center gap-4">
        <div className="w-14 h-14 bg-zinc-800 rounded flex-shrink-0">
          <img
            src={activeSong.coverImage}
            alt="Album cover"
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm text-white hover:underline truncate cursor-pointer">{activeSong.title}</span>
          <span className="text-xs text-zinc-400 hover:underline hover:text-white truncate cursor-pointer">{activeSong.artist}</span>
        </div>
        <button 
          onClick={() => toggleLike(activeSong._id)}
          className="ml-2 flex-shrink-0"
        >
          <Heart className={clsx("w-4 h-4 transition-colors", activeSong.liked ? "fill-green-500 text-green-500" : "text-zinc-400 hover:text-white")} />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex-1 max-w-[722px] flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={`transition ${isShuffled ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={prevSong}
            className="text-zinc-400 hover:text-white transition"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button onClick={nextSong} className="text-zinc-400 hover:text-white transition">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={toggleRepeat}
            className={`transition ${isRepeating ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-xs text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <div 
            className="h-1 flex-1 bg-zinc-600 rounded-full group cursor-pointer flex items-center relative py-2"
            onClick={handleSeek}
          >
            <div className="h-1 w-full bg-zinc-600 rounded-full absolute top-1/2 -translate-y-1/2"></div>
            <div className="h-1 bg-white group-hover:bg-green-500 rounded-full absolute top-1/2 -translate-y-1/2" style={{ width: `${progress || 0}%` }}>
              <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100"></div>
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="w-[30%] min-w-[180px] flex items-center justify-end gap-4 text-zinc-400">
        <Mic2 className="w-4 h-4 hover:text-white transition cursor-pointer" />
        <ListMusic className="w-4 h-4 hover:text-white transition cursor-pointer" />
        <MonitorSpeaker className="w-4 h-4 hover:text-white transition cursor-pointer" />
        <div className="flex items-center gap-2 w-24">
          <Volume2 
            className="w-4 h-4 hover:text-white transition cursor-pointer" 
            onClick={() => setVolume(volume === 0 ? 75 : 0)}
          />
          <div 
            className="h-1 flex-1 bg-zinc-600 rounded-full group cursor-pointer flex items-center relative py-2"
            onClick={handleVolume}
          >
            <div className="h-1 w-full bg-zinc-600 rounded-full absolute top-1/2 -translate-y-1/2"></div>
            <div className="h-1 bg-white group-hover:bg-green-500 rounded-full absolute top-1/2 -translate-y-1/2" style={{ width: `${volume}%` }}>
              <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
