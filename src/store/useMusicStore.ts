import { create } from 'zustand';
import { api } from '../services/api';

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  audioUrl: string;
  coverImage: string;
  liked?: boolean;
}

interface MusicStore {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  isShuffled: boolean;
  isRepeating: boolean;
  fetchSongs: () => Promise<void>;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songId: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  songs: [],
  currentSong: null,
  isPlaying: false,
  queue: [],
  history: [],
  isShuffled: false,
  isRepeating: false,

  toggleLike: async (songId) => {
    try {
      const { data } = await api.put(`/songs/${songId}/like`);
      set((state) => ({
        songs: state.songs.map((song) => 
          song._id === songId ? { ...song, liked: data.liked } : song
        )
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  },

  fetchSongs: async () => {
    try {
      const { data } = await api.get('/songs');
      set({ songs: data });
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  },

  playSong: (song, newQueue) => {
    const { currentSong, history, songs } = get();
    set({ 
      currentSong: song, 
      isPlaying: true,
      queue: newQueue || songs,
      history: currentSong ? [...history, currentSong] : history
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  nextSong: () => {
    const { currentSong, queue, isShuffled, history } = get();
    if (!currentSong || queue.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      const currentIndex = queue.findIndex(s => s._id === currentSong._id);
      nextIndex = currentIndex !== -1 ? (currentIndex + 1) % queue.length : 0;
    }

    const next = queue[nextIndex];
    set({
      currentSong: next,
      isPlaying: true,
      history: [...history, currentSong]
    });
  },

  prevSong: () => {
    const { currentSong, history, queue } = get();
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set({
        currentSong: prev,
        isPlaying: true,
        history: history.slice(0, -1)
      });
    } else if (queue.length > 0) {
       const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
       if (currentIndex !== -1) {
         const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
         set({ currentSong: queue[prevIndex], isPlaying: true });
       }
    }
  },

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
  toggleRepeat: () => set((state) => ({ isRepeating: !state.isRepeating })),
}));
