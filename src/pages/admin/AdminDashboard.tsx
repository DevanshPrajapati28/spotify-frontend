import { Link } from "react-router-dom";
import { Music, Disc, Users, ListVideo, ArrowLeft, Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

interface SongData {
  id: string;
  file: File;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  coverImageBase64: string | null;
  coverImageFile: File | null;
  status: 'Ready' | 'Uploading' | 'Success' | 'Error';
  hasTitle: boolean;
  hasArtist: boolean;
  hasAlbum: boolean;
  hasGenre: boolean;
  hasCover: boolean;
}

function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function AdminDashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [songs, setSongs] = useState<SongData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbStats, setDbStats] = useState({
    totalSongs: 0,
    totalAlbums: 0,
    totalArtists: 0,
    totalPlaylists: 0
  });
  const [existingSongs, setExistingSongs] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, songsRes] = await Promise.all([
        api.get('/songs/admin/stats'),
        api.get('/songs')
      ]);
      setDbStats(statsRes.data);
      setExistingSongs(songsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      await api.delete(`/songs/${id}`);
      toast.success('Song deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete song');
    }
  };

  const handleDeleteAlbum = async (album: string) => {
    if (!window.confirm(`Are you sure you want to delete the entire album "${album}" and all its songs?`)) return;
    try {
      await api.delete(`/songs/album/${encodeURIComponent(album)}`);
      toast.success('Album deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  const stats = [
    { label: "Total Songs", value: dbStats.totalSongs.toString(), icon: Music, color: "bg-green-500/10 text-green-500" },
    { label: "Total Albums", value: dbStats.totalAlbums.toString(), icon: Disc, color: "bg-blue-500/10 text-blue-500" },
    { label: "Total Artists", value: dbStats.totalArtists.toString(), icon: Users, color: "bg-purple-500/10 text-purple-500" },
    { label: "Total Playlists", value: dbStats.totalPlaylists.toString(), icon: ListVideo, color: "bg-orange-500/10 text-orange-500" },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Reading MP3 metadata...');
    const files = Array.from(e.target.files);
    
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('audios', f));
      
      const res = await api.post('/songs/parse-metadata', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const parsedData = res.data;
      
      const newSongs: SongData[] = files.map((file, index) => {
        const meta = parsedData[index];
        const isFallbackTitle = !meta.title || meta.title === file.name.replace(/\.[^/.]+$/, "");
        
        return {
          id: Math.random().toString(36).substring(7),
          file,
          title: meta.title || '',
          artist: meta.artist || '',
          album: meta.album || '',
          genre: meta.genre || '',
          duration: meta.duration || 0,
          coverImageBase64: meta.coverImage || null,
          coverImageFile: meta.coverImage ? base64ToFile(meta.coverImage, `cover_${index}.jpg`) : null,
          status: 'Ready',
          hasTitle: !!meta.title && !isFallbackTitle,
          hasArtist: !!meta.artist,
          hasAlbum: !!meta.album,
          hasGenre: !!meta.genre,
          hasCover: !!meta.coverImage
        };
      });
      
      setSongs(prev => [...prev, ...newSongs]);
      toast.success('Metadata extracted successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to parse metadata';
      toast.error(`Error: ${errorMessage}`, { id: loadingToast });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateSong = (id: string, field: keyof SongData, value: any) => {
    setSongs(songs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCoverUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSongs(songs.map(s => s.id === id ? { 
        ...s, 
        coverImageFile: file, 
        coverImageBase64: e.target?.result as string 
      } : s));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAll = async () => {
    const readySongs = songs.filter(s => s.status === 'Ready' || s.status === 'Error');
    
    if (readySongs.length === 0) return;

    if (readySongs.some(s => !s.coverImageFile)) {
      toast.error('Please provide a cover image for all songs.');
      return;
    }
    
    if (readySongs.some(s => !s.title || !s.artist || !s.album || !s.genre)) {
       toast.error('Please fill out all missing metadata fields.');
       return;
    }

    let successCount = 0;
    
    for (const song of readySongs) {
      updateSong(song.id, 'status', 'Uploading');
      try {
        const formData = new FormData();
        formData.append('title', song.title);
        formData.append('artist', song.artist);
        formData.append('album', song.album);
        formData.append('genre', song.genre);
        formData.append('duration', song.duration.toString());
        formData.append('audio', song.file);
        if (song.coverImageFile) {
          formData.append('coverImage', song.coverImageFile);
        }

        await api.post('/songs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        updateSong(song.id, 'status', 'Success');
        successCount++;
      } catch (error) {
        console.error(error);
        updateSong(song.id, 'status', 'Error');
        toast.error(`Failed to upload ${song.title}`);
      }
    }
    
    if (successCount === readySongs.length) {
      toast.success('All songs uploaded successfully!');
      fetchDashboardData();
    } else if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} out of ${readySongs.length} songs.`);
      fetchDashboardData();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const removeSong = (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
  };

  const groupedByAlbum = existingSongs.reduce((acc: any, song) => {
    if (!acc[song.album]) acc[song.album] = [];
    acc[song.album].push(song);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-zinc-900 p-6 rounded-xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-400 text-sm">{stat.label}</span>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-zinc-900 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-500" />
              Intelligent Upload System
            </h2>
            <div className="flex gap-4">
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                id="audio-upload"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <label
                htmlFor="audio-upload"
                className={`bg-zinc-800 text-white px-4 py-2 rounded font-bold cursor-pointer hover:bg-zinc-700 transition flex items-center gap-2 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Music className="w-4 h-4" />}
                Select MP3 Files
              </label>
              
              {songs.some(s => s.status === 'Ready' || s.status === 'Error') && (
                <button
                  onClick={handleUploadAll}
                  className="bg-green-500 text-black font-bold px-4 py-2 rounded hover:bg-green-400 transition"
                >
                  Upload Ready Songs
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {songs.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800 text-sm">
                    <th className="pb-2 font-medium w-16">Cover</th>
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Artist</th>
                    <th className="pb-2 font-medium">Album</th>
                    <th className="pb-2 font-medium">Genre</th>
                    <th className="pb-2 font-medium w-20">Duration</th>
                    <th className="pb-2 font-medium w-32">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map(song => (
                    <tr key={song.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-3">
                        {song.coverImageBase64 ? (
                          <div className="relative group w-12 h-12">
                            <img src={song.coverImageBase64} alt="Cover" className="w-12 h-12 rounded object-cover" />
                            {!song.hasCover && (
                              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded transition">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleCoverUpload(song.id, e.target.files[0])} />
                              </label>
                            )}
                          </div>
                        ) : (
                          <label className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition">
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleCoverUpload(song.id, e.target.files[0])} />
                          </label>
                        )}
                      </td>
                      <td className="py-3 pr-2">
                        <input 
                          type="text" 
                          value={song.title} 
                          onChange={e => updateSong(song.id, 'title', e.target.value)}
                          disabled={song.hasTitle}
                          placeholder="Required"
                          className={`w-full p-2 rounded text-sm outline-none border transition ${song.hasTitle ? 'bg-transparent border-transparent text-white' : 'bg-zinc-800 border-zinc-700 focus:border-green-500'}`}
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input 
                          type="text" 
                          value={song.artist} 
                          onChange={e => updateSong(song.id, 'artist', e.target.value)}
                          disabled={song.hasArtist}
                          placeholder="Required"
                          className={`w-full p-2 rounded text-sm outline-none border transition ${song.hasArtist ? 'bg-transparent border-transparent text-white' : 'bg-zinc-800 border-zinc-700 focus:border-green-500'}`}
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input 
                          type="text" 
                          value={song.album} 
                          onChange={e => updateSong(song.id, 'album', e.target.value)}
                          disabled={song.hasAlbum}
                          placeholder="Required"
                          className={`w-full p-2 rounded text-sm outline-none border transition ${song.hasAlbum ? 'bg-transparent border-transparent text-white' : 'bg-zinc-800 border-zinc-700 focus:border-green-500'}`}
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input 
                          type="text" 
                          value={song.genre} 
                          onChange={e => updateSong(song.id, 'genre', e.target.value)}
                          disabled={song.hasGenre}
                          placeholder="Required"
                          className={`w-[100px] p-2 rounded text-sm outline-none border transition ${song.hasGenre ? 'bg-transparent border-transparent text-white' : 'bg-zinc-800 border-zinc-700 focus:border-green-500'}`}
                        />
                      </td>
                      <td className="py-3 text-sm text-zinc-400">
                        {formatDuration(song.duration)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {song.status === 'Ready' && <span className="text-zinc-400 text-sm">Ready</span>}
                          {song.status === 'Uploading' && (
                            <div className="flex items-center gap-1 text-blue-500 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Uploading
                            </div>
                          )}
                          {song.status === 'Success' && (
                            <div className="flex items-center gap-1 text-green-500 text-sm">
                              <CheckCircle className="w-4 h-4" /> Success
                            </div>
                          )}
                          {song.status === 'Error' && (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                              <XCircle className="w-4 h-4" /> Error
                            </div>
                          )}
                          {song.status !== 'Uploading' && song.status !== 'Success' && (
                            <button onClick={() => removeSong(song.id)} className="text-zinc-500 hover:text-red-500 text-xs ml-2 transition">Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl">
                 <Upload className="w-12 h-12 text-zinc-600 mb-4" />
                 <p className="text-zinc-400">No songs selected</p>
                 <p className="text-zinc-500 text-sm mt-1">Select one or multiple MP3 files to extract metadata</p>
               </div>
            )}
          </div>
        </section>

        <section className="bg-zinc-900 rounded-xl p-6 mt-4 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Disc className="w-5 h-5 text-blue-500" />
            Manage Library
          </h2>
          <div className="flex flex-col gap-8">
            {Object.entries(groupedByAlbum).map(([albumName, albumSongs]: [string, any]) => (
              <div key={albumName} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-800/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <img src={albumSongs[0].coverImage} className="w-16 h-16 rounded object-cover shadow-lg" alt="Album Cover" />
                    <div>
                      <h3 className="font-bold text-lg">{albumName}</h3>
                      <p className="text-sm text-zinc-400">{albumSongs[0].artist} • {albumSongs.length} {albumSongs.length === 1 ? 'song' : 'songs'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAlbum(albumName)}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Album
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {albumSongs.map((song: any) => (
                    <div key={song._id} className="flex items-center justify-between bg-zinc-900 p-3 rounded group hover:bg-zinc-800 transition">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Music className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{song.title}</p>
                          <p className="text-xs text-zinc-500 truncate">{formatDuration(song.duration)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSong(song._id)}
                        className="text-zinc-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition"
                        title="Delete Song"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedByAlbum).length === 0 && (
              <p className="text-zinc-500 text-center py-8">Your library is empty.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
