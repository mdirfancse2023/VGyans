import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import VideoGrid from './components/VideoGrid';
import PlacementHub from './components/PlacementHub';
import InterviewExperiences from './components/InterviewExperiences';
import InteractiveTools from './components/InteractiveTools';
import Playground from './components/Playground';
import Footer from './components/Footer';
import FeedbackButton from './components/FeedbackButton';
import Jobs from './components/Jobs';
import CareerCoach from './components/CareerCoach';
import Songs from './components/Songs';
import MiniPlayer from './components/MiniPlayer';
import AuthModal from './components/AuthModal';
import { verifyJWT } from './utils/jwtUtils';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://v-gyans.vercel.app'
);

const cleanChannel = (ch) => ch ? {
  ...ch,
  avatarUrl: (!ch.avatarUrl || ch.avatarUrl.includes('unsplash')) ? '/youtube-avatar.png' : ch.avatarUrl,
  bannerUrl: (!ch.bannerUrl || ch.bannerUrl.includes('unsplash')) ? '/youtube-banner.png' : ch.bannerUrl,
} : ch;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // User Auth State & Persistent Refresh/Access Token Verification
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('vg_user');
      const refreshToken = localStorage.getItem('vg_refresh_token');
      const accessToken = localStorage.getItem('vg_access_token');
      
      // Auto-authenticate continuous session if tokens or saved user exists
      if (refreshToken || accessToken || savedUser) {
        if (savedUser) return JSON.parse(savedUser);
        return {
          id: 'user_mdirfan_01',
          name: 'Md Irfan',
          email: 'mdirfancse2023@gamil.com',
          avatar: 'I',
          joinedDate: 'July 2026'
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('vg_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vg_user');
    localStorage.removeItem('vg_jwt_token');
    localStorage.removeItem('vg_access_token');
    localStorage.removeItem('vg_refresh_token');
    localStorage.removeItem('vg_token_expires');
  };
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Anti-Screenshot & Content Protection Security Guard
  const [isScreenProtected, setIsScreenProtected] = useState(false);

  useEffect(() => {
    // 0. Disable window.print()
    window.print = () => {
      setIsScreenProtected(true);
      setTimeout(() => setIsScreenProtected(false), 2000);
      return false;
    };

    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Copy & Cut outside form input fields
    const handleCopyCut = (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!isInput) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '');
        }
        return false;
      }
    };

    // 3. Block Dragging
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 4. Block Inspect Element / DevTools / Copy Shortcuts / PrintScreen & Mac Screenshot Keys
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : '';

      // Block F12
      if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+U / Cmd+U (View Source)
      if (isCmdOrCtrl && key === 'u') {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+P / Cmd+P (Print Page)
      if (isCmdOrCtrl && key === 'p') {
        e.preventDefault();
        setIsScreenProtected(true);
        setTimeout(() => setIsScreenProtected(false), 2000);
        return false;
      }

      // Block Ctrl+S / Cmd+S (Save Page)
      if (isCmdOrCtrl && key === 's') {
        e.preventDefault();
        return false;
      }

      // Block Inspect: Ctrl+Shift+I, Cmd+Opt+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (isCmdOrCtrl && (e.shiftKey || e.altKey) && (key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        return false;
      }

      // Block Copy: Ctrl+C / Cmd+C outside input/textarea
      if (isCmdOrCtrl && key === 'c') {
        const target = e.target;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          return false;
        }
      }

      // PrintScreen Key -> Clear Clipboard & Trigger Blank Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
        setIsScreenProtected(true);
        setTimeout(() => setIsScreenProtected(false), 2000);
        return false;
      }

      // macOS Screenshot Shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) {
        setIsScreenProtected(true);
        setTimeout(() => setIsScreenProtected(false), 2500);
      }
    };

    // 5. Blank Screen on Window Blur / Visibility Change (Snipping Tool & Screenshot grabbers focus loss protection)
    const handleBlur = () => {
      setIsScreenProtected(true);
    };

    const handleFocus = () => {
      setTimeout(() => {
        setIsScreenProtected(false);
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenProtected(true);
      } else {
        setTimeout(() => {
          setIsScreenProtected(false);
        }, 300);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  const [channelStats, setChannelStats] = useState({
    subscriberCount: '2.05K+',
    viewCount: '435K+',
    videoCount: '131+',
    avatarUrl: '/youtube-avatar.png',
    bannerUrl: '/youtube-banner.png',
    title: 'Virtual Gyans',
    description: 'Welcome to Virtual Gyans - Educational & Technical Content.'
  });
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [resources, setResources] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [onboardingStages, setOnboardingStages] = useState({});
  const [isBlurred, setIsBlurred] = useState(false);
  const [notes, setNotes] = useState([]);
  const [playgroundQuestions, setPlaygroundQuestions] = useState([]);

  // Music Player States
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState('normal'); // 'normal' | 'loop' | 'shuffle'
  const [ambientSounds, setAmbientSounds] = useState({ rain: 0, wind: 0 });

  // Refs for HTML5 Audio & Web Audio API
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rainSourceRef = useRef(null);
  const windSourceRef = useRef(null);
  const rainGainRef = useRef(null);
  const windGainRef = useRef(null);

  // Sync Audio Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync Play/Pause State
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (audioRef.current.src) {
        audioRef.current.play().catch(e => console.warn("Playback failed:", e));
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Cleanup Web Audio API nodes on unmount
  useEffect(() => {
    return () => {
      try {
        if (rainSourceRef.current) rainSourceRef.current.stop();
        if (windSourceRef.current) windSourceRef.current.stop();
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch (e) {}
    };
  }, []);

  const playSong = (song) => {
    if (!audioRef.current) return;
    const isSameSong = currentSong && currentSong.id === song.id;
    if (isSameSong) {
      togglePlay();
    } else {
      setCurrentSong(song);
      audioRef.current.src = song.url;
      audioRef.current.load();
      setIsPlaying(true);
      setDuration(song.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    if (playbackMode === 'loop') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {});
      }
      return;
    }
    
    let nextIndex = 0;
    if (playbackMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
      nextIndex = (currentIndex + 1) % songs.length;
    }
    playSong(songs[nextIndex]);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songs.length - 1;
    }
    playSong(songs[prevIndex]);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSongEnded = () => {
    nextSong();
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setCurrentSong(null);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  };

  // Ambient Sound Synthesis Logic (Web Audio API)
  const initAmbientAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. Create Rain Node (Filtered White Noise)
      const bufferSize = 2 * ctx.sampleRate;
      const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        rainData[i] = Math.random() * 2 - 1;
      }
      
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0, ctx.currentTime);

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1000, ctx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(ctx.destination);
      rainSrc.start(0);

      rainSourceRef.current = rainSrc;
      rainGainRef.current = rainGain;

      // 2. Create Forest Wind Node (Brown Noise)
      const windBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        windData[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = windData[i];
        windData[i] *= 3.5;
      }

      const windSrc = ctx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0, ctx.currentTime);

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(400, ctx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      windSrc.start(0);

      windSourceRef.current = windSrc;
      windGainRef.current = windGain;

      console.log("Ambient Audio Synthesizer initialized!");
    } catch (e) {
      console.warn("Web Audio API failed to initialize:", e);
    }
  };

  const setAmbientSoundVolume = (sound, vol) => {
    setAmbientSounds(prev => {
      const next = { ...prev, [sound]: vol };
      
      initAmbientAudio();
      
      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        if (sound === 'rain' && rainGainRef.current) {
          rainGainRef.current.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
        } else if (sound === 'wind' && windGainRef.current) {
          windGainRef.current.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable right click context menu
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // Disable copy and cut
    const handleCopyCut = (e) => e.preventDefault();
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);

    // Disable dragging (to prevent image saving or text drag-out)
    const handleDragStart = (e) => e.preventDefault();
    document.addEventListener('dragstart', handleDragStart);

    // Keyboard Shortcuts protection
    const handleKeyDown = (e) => {
      // Block Ctrl+C / Cmd+C, Ctrl+X / Cmd+X, Ctrl+S / Cmd+S, Ctrl+P / Cmd+P, Ctrl+U / Cmd+U
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 's', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Block F12, Ctrl+Shift+I / Cmd+Opt+I (DevTools shortcuts)
      if (
        e.key === 'F12' || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase())) ||
        ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'i')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const sortVideosNewestFirst = (vList) => {
        if (!Array.isArray(vList)) return [];
        return [...vList].sort((a, b) => {
          const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return timeB - timeA;
        });
      };

      // 1. Fetch static local segregated JSONs immediately
      try {
        const fetchJSON = async (file) => {
          const relativePaths = [`./data/${file}.json`, `/data/${file}.json`, `data/${file}.json` ];
          for (const p of relativePaths) {
            try {
              const res = await fetch(p);
              if (res.ok) {
                const data = await res.json();
                if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                  return data;
                }
              }
            } catch (e) {}
          }
          return null;
        };

        const [
          channel, playlistsRes, resourcesRes, experiencesRes, onboardingStagesRes
        ] = await Promise.all([
          fetchJSON('channel'),
          fetchJSON('playlists'),
          fetchJSON('resources'),
          fetchJSON('experiences'),
          fetchJSON('onboardingStages')
        ]);

        if (channel) setChannelStats(cleanChannel(channel));
        if (playlistsRes) setPlaylists(playlistsRes);
        if (resourcesRes) setResources(resourcesRes);
        if (experiencesRes) setExperiences(experiencesRes);
        if (onboardingStagesRes) setOnboardingStages(onboardingStagesRes);
      } catch (err) {
        console.warn('Local static data load notice:', err);
      }

      setLoading(false);

      // 2. Fetch live data from FastAPI (or Vercel backend)
      try {
        const liveTarget = `${API_URL}/api/all`;
        console.log(`Fetching live database content from: ${liveTarget}`);
        const liveRes = await fetch(liveTarget);
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          if (liveData.channel) setChannelStats(cleanChannel(liveData.channel));
          if (liveData.playlists) setPlaylists(liveData.playlists);
          if (liveData.videos && Array.isArray(liveData.videos) && liveData.videos.length > 0) {
            setVideos(sortVideosNewestFirst(liveData.videos));
          }
          if (liveData.resources) {
            setResources(prev => {
              const merged = [...liveData.resources];
              const liveIds = new Set(merged.map(r => r.id));
              prev.forEach(localRes => {
                if (!liveIds.has(localRes.id)) merged.push(localRes);
              });
              return merged;
            });
          }
          if (liveData.experiences) setExperiences(liveData.experiences);
          if (liveData.flashcards) {
            setFlashcards(prev => {
              const merged = liveData.flashcards.map(liveFc => {
                if (!liveFc.question || !liveFc.answer) {
                  const local = prev.find(f => f.id === liveFc.id);
                  if (local && local.question && local.answer) {
                    return { ...liveFc, question: local.question, answer: local.answer };
                  }
                }
                return liveFc;
              });
              const liveIds = new Set(merged.map(f => f.id));
              prev.forEach(localFc => {
                if (!liveIds.has(localFc.id)) merged.push(localFc);
              });
              return merged;
            });
          }
          if (liveData.onboardingStages) setOnboardingStages(liveData.onboardingStages);
          if (liveData.notes) {
            setNotes(prev => {
              const merged = liveData.notes.map(liveNote => {
                if (!liveNote.content || liveNote.content.length === 0) {
                  const local = prev.find(n => n.id === liveNote.id);
                  if (local && local.content) {
                    return { ...liveNote, content: local.content };
                  }
                }
                return liveNote;
              });
              const liveIds = new Set(merged.map(n => n.id));
              prev.forEach(localNote => {
                if (!liveIds.has(localNote.id)) merged.push(localNote);
              });
              return merged;
            });
          }
          if (liveData.playground_questions) setPlaygroundQuestions(liveData.playground_questions);
        }
      } catch (err) {
        console.warn('Live API background fetch skipped:', err);
      }
    };

    fetchData();
  }, []);

  // Real-time Live YouTube Video Fetcher
  useEffect(() => {
    const fetchRealtimeLiveVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const vRes = await fetch(`${API_URL}/api/videos`);
        if (vRes.ok) {
          const liveVids = await vRes.json();
          if (liveVids && liveVids.length > 0) {
            setVideos(liveVids);
            setIsLoadingVideos(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Real-time videos backend fetch notice:', err);
      }

      // Fallback direct live fetch using YouTube channel scrape & oEmbed
      try {
        const ytUrl = 'https://www.youtube.com/@virtualgyans/videos';
        const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(ytUrl)}`);
        if (res.ok) {
          const html = await res.text();
          const matches = html.match(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g);
          if (matches) {
            const uniqueIds = Array.from(new Set(matches.map(m => m.split('"')[3]))).slice(0, 25);
            const liveVids = uniqueIds.map((vId, idx) => ({
              id: vId,
              title: `Virtual Gyans Video #${idx + 1}`,
              description: 'Watch the latest Virtual Gyans tutorial and guidance video.',
              thumbnailUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              category: idx % 2 === 0 ? 'Placement Prep' : 'Technical',
              videoUrl: `https://www.youtube.com/watch?v=${vId}`
            }));
            setVideos(liveVids);
          }
        }
      } catch (e) {
        console.warn('Client fallback live videos notice:', e);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchRealtimeLiveVideos();
  }, []);

  // Handle new experience submission
  const handleSubmitExperience = async (newExp) => {
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/api/experiences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExp)
        });
        if (res.ok) {
          const saved = await res.json();
          return saved.experience;
        }
      }
    } catch (e) {
      console.warn('Could not post to backend API, simulating local save.', e);
    }
    
    // Static mode simulation
    return {
      ...newExp,
      id: `exp-sim-${Date.now()}`
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#070a13', color: '#fff' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
        <p style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>Loading Virtual Gyans...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={`content-protected ${isBlurred ? 'blurred' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Animated Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        nextSong={nextSong}
        prevSong={prevSong}
        currentTime={currentTime}
        duration={duration}
        seek={seek}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ flexGrow: 1 }}>
        {error && (
          <div style={{ maxWidth: '1200px', margin: '2rem auto 0', padding: '1rem 2rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--text-primary)' }}>
            <strong>Configuration Warning:</strong> {error} (Falling back to local parameters)
          </div>
        )}

        {activeTab === 'home' && (
          <section>
            <Hero stats={channelStats} setActiveTab={setActiveTab} />
            
            {/* Featured Videos Dashboard Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              <div>
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h2 className="section-title">Featured <span className="text-gradient">Tutorials</span></h2>
                    <p className="section-desc">Hand-picked videos to kickstart your preparation.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('videos')} style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
                    View All Videos →
                  </button>
                </div>
                
                <div className="grid-container">
                  {videos.slice(0, 4).map((video) => (
                    <div 
                      key={video.id} 
                      className="glass-card video-card"
                      onClick={() => setActiveTab('videos')}
                    >
                      <div className="video-thumb-container">
                        <img 
                          src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                          alt={video.title} 
                          className="video-thumb" 
                        />
                      </div>
                      <div className="video-body">
                        <h3 className="video-title" style={{ height: 'auto', marginBottom: '0.5rem' }}>{video.title}</h3>
                        <p className="video-desc" style={{ WebkitLineClamp: 2 }}>{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Resources Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Recommended Blueprints</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {resources.slice(0, 2).map((res) => (
                      <div key={res.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{res.company}</span>
                          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{res.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{res.description}</p>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setActiveTab('guides')} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                          Access
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ background: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span className="badge badge-secondary" style={{ width: 'fit-content', marginBottom: '0.75rem' }}>Featured Experience</span>
                  {experiences[0] ? (
                    <>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>{experiences[0].role}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
                        Shared by {experiences[0].candidate} ({experiences[0].date})
                      </p>
                      <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
                        "{experiences[0].tips.substring(0, 100)}..."
                      </div>
                      <button className="btn btn-primary" onClick={() => setActiveTab('guides')} style={{ marginTop: '1rem', padding: '0.4rem', fontSize: '0.8rem', width: '100%' }}>
                        Read Full Experience
                      </button>
                    </>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No interview logs loaded.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'videos' && (
          <section>
            <VideoGrid videos={videos} isLoading={isLoadingVideos} />
          </section>
        )}

        {activeTab === 'guides' && (
          <section>
            <PlacementHub 
              resources={resources} 
              notes={notes} 
              onboardingStages={onboardingStages} 
              flashcards={flashcards}
              experiences={experiences}
              onSubmitExperience={handleSubmitExperience}
            />
          </section>
        )}

        {activeTab === 'playground' && (
          <section className="playground-section">
            <Playground questions={playgroundQuestions} onGoHome={() => setActiveTab('home')} />
          </section>
        )}

        {activeTab === 'tools' && (
          <section>
            <InteractiveTools 
              onboardingStages={onboardingStages} 
              flashcards={flashcards} 
              apiUrl={API_URL}
            />
          </section>
        )}

        {activeTab === 'jobs' && (
          <section>
            <Jobs />
          </section>
        )}

        {activeTab === 'songs' && (
          <section className="songs-section">
            <Songs
              songs={songs}
              setSongs={setSongs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playSong={playSong}
              togglePlay={togglePlay}
              nextSong={nextSong}
              prevSong={prevSong}
              volume={volume}
              setVolume={setVolume}
              currentTime={currentTime}
              duration={duration}
              seek={seek}
              playbackMode={playbackMode}
              setPlaybackMode={setPlaybackMode}
              ambientSounds={ambientSounds}
              setAmbientSoundVolume={setAmbientSoundVolume}
            />
          </section>
        )}
      </main>

      {activeTab !== 'playground' && <Footer />}
      <FeedbackButton isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} hideTrigger={true} />
      <CareerCoach />
      
      {/* Mandatory Auth Modal for Unauthenticated Visitors (Stores in Firebase Firestore) */}
      <AuthModal 
        isOpen={!user || isAuthOpen} 
        isGated={!user}
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Persistent Audio Element */}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnded}
      />

      {/* Screenshot & Screen Capture Protection Overlay */}
      {isScreenProtected && (
        <div className="screenshot-protection-overlay">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Content Protection Active</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '450px', margin: 0 }}>
            Screen capture, screenshots, and text copying are restricted for platform security.
          </p>
        </div>
      )}
    </div>
  );
}
