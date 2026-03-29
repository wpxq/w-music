"use client";
import { useEffect, useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ListMusic, Search } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  date_added: string;
  duration: number;
}

const formatTime = (time: number) => {
  if (isNaN(time) || time === Infinity) return "0:00";
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("http://localhost:8000/playlists")
      .then((res) => res.json())
      .then((data) => setPlaylists(data.playlists))
      .catch((err) => console.error("API Error:", err));
  }, []);

  const loadPlaylist = (name: string) => {
    setSelectedPlaylist(name);
    fetch(`http://localhost:8000/playlists/${name}`)
      .then((res) => res.json())
      .then((data) => setTracks(data.tracks))
      .catch((err) => console.error("Playlist Error:", err));
  };

  const playTrack = (track: Track) => {
    const isSameTrack = currentTrack?.id === track.id;
    
    if (isSameTrack && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (isSameTrack && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      setCurrentTrack(track);
      if (audioRef.current) {
        audioRef.current.src = `http://localhost:8000/stream-files/${encodeURI(track.id)}`;
        audioRef.current.load();
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    if (!currentTrack && tracks.length > 0) {
      playTrack(tracks[0]);
      return;
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(tracks[currentIndex - 1]);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      setProgress(dur > 0 ? (current / dur) * 100 : 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const filteredTracks = tracks.filter((track) =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-black text-zinc-400 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-10">
            <h1 className="font-black text-xl tracking-tighter italic">W-MUSIC</h1>
          </div>
          
          <nav>
            <div className="flex items-center gap-2 text-zinc-500 mb-4 px-2">
              <ListMusic className="w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Library</p>
            </div>
            <ul className="space-y-1">
              {playlists.map((p) => (
                <li 
                  key={p} 
                  onClick={() => loadPlaylist(p)}
                  className={`px-3 py-2 rounded-md cursor-pointer transition-all text-sm font-medium ${
                    selectedPlaylist === p 
                    ? 'bg-zinc-900 text-white' 
                    : 'hover:bg-zinc-900/50 hover:text-zinc-200'
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900/40 to-black pb-32">
        {selectedPlaylist ? (
          <div className="p-10 animate-in fade-in duration-700">
            <header className="flex items-end gap-6 mb-10">
              <div className="w-48 h-48 bg-zinc-800 shadow-2xl flex items-center justify-center rounded-lg overflow-hidden group">
                 <Music className="w-20 h-20 text-zinc-700 group-hover:text-blue-500 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Folder</p>
                <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic mb-2">{selectedPlaylist}</h2>
                <p className="text-zinc-500 text-sm font-medium">{tracks.length} Tracks</p>
              </div>
            </header>
            <div className="mb-6 relative group max-w-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search tracks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div className="grid grid-cols-[40px_1fr_120px_100px] gap-4 px-4 py-3 text-[10px] font-bold text-zinc-600 uppercase border-b border-zinc-800/50 mb-2">
              <span>#</span>
              <span>Title</span>
              <span className="text-right">Date added</span>
              <span className="text-right">Duration</span>
            </div>

            <div className="space-y-[2px]">
              {filteredTracks.map((track, i) => (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(track)}
                  className={`grid grid-cols-[40px_1fr_120px_100px] gap-4 items-center px-4 py-2 rounded-md group cursor-pointer transition-colors ${
                    currentTrack?.id === track.id ? 'bg-white/10 text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-600 group-hover:hidden">{i + 1}</span>
                    <Play className={`w-3 h-3 text-white hidden group-hover:block ${currentTrack?.id === track.id ? 'block text-blue-500' : ''}`} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                      {track.title}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">{track.artist}</span>
                  </div>

                  <span className="text-right font-mono text-[10px] text-zinc-500">
                    {track.date_added && !isNaN(Date.parse(track.date_added)) 
                      ? new Date(track.date_added).toLocaleDateString('cs-CZ') 
                      : '--.--.----'}
                  </span>

                  <span className="text-right font-mono text-xs text-zinc-500 group-hover:text-zinc-300">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
             <Music className="w-32 h-32 mb-4" />
             <p className="font-mono text-sm tracking-widest uppercase">Vyber playlist pro start</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900 px-8 flex items-center justify-between z-50">
        <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleNext}
        />

        <div className="w-1/3 flex items-center gap-4">
          {currentTrack ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <p className="text-sm font-bold text-white leading-tight">{currentTrack.title}</p>
              <p className="text-[11px] text-zinc-500 leading-tight mt-1 uppercase tracking-widest">{currentTrack.artist}</p>
            </div>
          ) : (
            <div className="text-xs text-zinc-700 font-mono italic">No track selected</div>
          )}
        </div>

        <div className="w-1/3 flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <SkipBack 
                onClick={handlePrev}
                className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" 
            />
            
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-1" />
              )}
            </button>

            <SkipForward 
                onClick={handleNext}
                className="w-5 h-5 text-zinc-600 hover:text-white cursor-pointer transition-colors" 
            />
          </div>

          <div className="w-full max-md flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-600 w-10 text-right">{formatTime(currentTime)}</span>
            
            <div 
              className="flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer group relative flex items-center" 
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-blue-500 group-hover:bg-blue-400 rounded-full transition-all relative" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-opacity" />
              </div>
            </div>

            <span className="text-[10px] font-mono text-zinc-600 w-10">
              {currentTrack ? formatTime(duration) : "0:00"}
            </span>
          </div>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-6">
          <div className="flex items-center gap-3">
             <Volume2 className="w-4 h-4 text-zinc-600" />
             <input 
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
             />
          </div>
        </div>
      </footer>
    </div>
  );
}