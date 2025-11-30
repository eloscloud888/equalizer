import React, { useEffect, useRef, useState } from 'react';
import { AudioStatus, EqualizerSettings } from '../types';

// Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const ForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>;
const BackwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>;
const ShuffleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l-3.5-3.5"/><path d="M4 4l5 5"/></svg>;
const FilePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const FolderPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// --- Persistence Helpers ---
const DB_NAME = 'SonicAudioDB';
const STORE_NAME = 'playlist';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
  });
};

const savePlaylistToDB = async (files: File[]) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear(); // Simple strategy: clear and rewrite to ensure order matches state
    files.forEach(file => store.add(file));
  } catch (error) {
    console.error("Error saving playlist to DB:", error);
  }
};

const loadPlaylistFromDB = async (): Promise<File[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as File[]);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error loading playlist from DB:", error);
    return [];
  }
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const Equalizer: React.FC = () => {
  const [status, setStatus] = useState<AudioStatus>(AudioStatus.IDLE);
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isShuffle, setIsShuffle] = useState(false); // Shuffle State
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 1,
  });
  
  // Visualizer State
  const [visualizerTheme, setVisualizerTheme] = useState('Default');
  const [visualizerHue, setVisualizerHue] = useState(0); // Hue rotation angle (-180 to 180)
  const [customColors, setCustomColors] = useState({ start: '#6366f1', end: '#a855f7' });
  
  const [isRestoring, setIsRestoring] = useState(true);

  // Refs for animation & Audio
  const visualizerThemeRef = useRef('Default');
  const visualizerHueRef = useRef(0);
  const customColorsRef = useRef({ start: '#6366f1', end: '#a855f7' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for State in callbacks
  const playlistRef = useRef<File[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const playRequestRef = useRef<number>(0); // Track the latest play request ID to prevent race conditions
  const isShuffleRef = useRef(false);

  // Create a ref for status to access it synchronously inside requestAnimationFrame loop
  const statusRef = useRef<AudioStatus>(AudioStatus.IDLE);
  
  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Sync state to refs
  useEffect(() => {
    playlistRef.current = playlist;
    currentIndexRef.current = currentTrackIndex;
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    visualizerThemeRef.current = visualizerTheme;
  }, [visualizerTheme]);

  useEffect(() => {
    visualizerHueRef.current = visualizerHue;
  }, [visualizerHue]);

  useEffect(() => {
    customColorsRef.current = customColors;
  }, [customColors]);

  // Sync status ref and trigger animation
  useEffect(() => {
    statusRef.current = status;
    
    if (status === AudioStatus.PLAYING) {
        drawVisualizer();
    } else {
        cancelAnimationFrame(animationFrameRef.current);
    }
  }, [status]);

  // Load Settings & Playlist on Mount
  useEffect(() => {
    const loadData = async () => {
      // 1. Load EQ Settings
      const savedEq = localStorage.getItem('sonic_eq_settings');
      if (savedEq) {
        try { setEqSettings(JSON.parse(savedEq)); } catch(e){}
      }

      // 2. Load Visualizer Settings
      const savedTheme = localStorage.getItem('sonic_visualizer_theme');
      if (savedTheme) setVisualizerTheme(savedTheme);
      
      const savedHue = localStorage.getItem('sonic_visualizer_hue');
      if (savedHue) setVisualizerHue(Number(savedHue));

      const savedCustomColors = localStorage.getItem('sonic_custom_colors');
      if (savedCustomColors) {
          try { setCustomColors(JSON.parse(savedCustomColors)); } catch(e){}
      }

      const savedShuffle = localStorage.getItem('sonic_shuffle_mode');
      if (savedShuffle) setIsShuffle(savedShuffle === 'true');

      // 3. Load Playlist from IndexedDB
      const savedFiles = await loadPlaylistFromDB();
      if (savedFiles && savedFiles.length > 0) {
        setPlaylist(savedFiles);
      }
      setIsRestoring(false);
    };

    loadData();
  }, []);

  // Save Settings when changed
  useEffect(() => {
    localStorage.setItem('sonic_eq_settings', JSON.stringify(eqSettings));
  }, [eqSettings]);

  useEffect(() => {
    localStorage.setItem('sonic_visualizer_theme', visualizerTheme);
  }, [visualizerTheme]);

  useEffect(() => {
    localStorage.setItem('sonic_visualizer_hue', visualizerHue.toString());
  }, [visualizerHue]);

  useEffect(() => {
    localStorage.setItem('sonic_custom_colors', JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('sonic_shuffle_mode', String(isShuffle));
  }, [isShuffle]);

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      stopAudio();
      audioContextRef.current?.close();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update Filters when settings change
  useEffect(() => {
    if (bassFilterRef.current) bassFilterRef.current.gain.value = eqSettings.bass;
    if (midFilterRef.current) midFilterRef.current.gain.value = eqSettings.mid;
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = eqSettings.treble;
    if (gainNodeRef.current) gainNodeRef.current.gain.value = eqSettings.volume;
  }, [eqSettings]);

  const addToPlaylist = (files: FileList | null) => {
    if (!files) return;
    // Filter for audio files more robustly
    const newFiles = Array.from(files).filter(f => 
        f.type.startsWith('audio/') || 
        f.name.toLowerCase().endsWith('.mp3') || 
        f.name.toLowerCase().endsWith('.wav') || 
        f.name.toLowerCase().endsWith('.ogg') ||
        f.name.toLowerCase().endsWith('.m4a') ||
        f.name.toLowerCase().endsWith('.flac')
    );
    
    setPlaylist(prev => {
        const updated = [...prev, ...newFiles];
        // Persist to DB
        savePlaylistToDB(updated);
        
        // Auto-play if it's the first track added
        if (prev.length === 0 && newFiles.length > 0) {
            playTrack(0, updated);
        }
        return updated;
    });
  };

  const removeFromPlaylist = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Stop if removing the playing track
    if (index === currentTrackIndex) {
        stopAudio();
        setCurrentTrackIndex(-1);
    } else if (index < currentTrackIndex) {
        // Adjust index if removing a track before the current one
        setCurrentTrackIndex(prev => prev - 1);
    }

    setPlaylist(prev => {
        const newPlaylist = [...prev];
        newPlaylist.splice(index, 1);
        savePlaylistToDB(newPlaylist);
        return newPlaylist;
    });
  };

  const clearPlaylist = () => {
    stopAudio();
    setCurrentTrackIndex(-1);
    setPlaylist([]);
    savePlaylistToDB([]); // Ensure DB is cleared
  };

  const playTrack = async (index: number, currentPlaylist = playlistRef.current) => {
    if (index < 0 || index >= currentPlaylist.length) return;
    
    // 1. Generate a new Request ID for this specific play attempt
    const requestId = Date.now();
    playRequestRef.current = requestId;

    // 2. STOP everything immediately
    stopAudio();

    const file = currentPlaylist[index];
    if (!file) return;

    setCurrentTrackIndex(index);
    setStatus(AudioStatus.IDLE); 
    pauseTimeRef.current = 0;

    const reader = new FileReader();
    reader.onload = async (e) => {
      // 3. CHECK: Has the user clicked another song while we were reading the file?
      if (playRequestRef.current !== requestId) {
          console.log("Play aborted: stale request (file read)");
          return;
      }

      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (audioContextRef.current) {
          try {
            // 4. Decode
            const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            // 5. CHECK: Has the user clicked another song while we were decoding?
            if (playRequestRef.current !== requestId) {
                console.log("Play aborted: stale request (decode)");
                return;
            }

            audioBufferRef.current = decodedAudio;
            playAudio(requestId);
          } catch (err) {
            console.error("Error decoding audio:", err);
            // Only try next if this was still the active request
            if (playRequestRef.current === requestId) {
                 playNext();
            }
          }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const playNext = () => {
      const len = playlistRef.current.length;
      if (len === 0) return;

      if (isShuffleRef.current) {
          // Play random track
          let nextIndex = Math.floor(Math.random() * len);
          // Try to avoid playing the same song twice unless it's the only one
          if (len > 1 && nextIndex === currentIndexRef.current) {
             while(nextIndex === currentIndexRef.current) {
                 nextIndex = Math.floor(Math.random() * len);
             }
          }
          playTrack(nextIndex);
      } else {
          // Sequential
          if (currentIndexRef.current < len - 1) {
              playTrack(currentIndexRef.current + 1);
          }
      }
  };

  const playPrev = () => {
      if (currentIndexRef.current > 0) {
          playTrack(currentIndexRef.current - 1);
      }
  };

  const drawVisualizer = () => {
    // Check refs to ensure we can draw
    if (!analyserRef.current || !canvasRef.current) return;
    // Check status ref for synchronous state
    if (statusRef.current !== AudioStatus.PLAYING) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Clear with no filter to ensure clean background
    ctx.filter = 'none';
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    const theme = visualizerThemeRef.current;
    const hue = visualizerHueRef.current;
    const custom = customColorsRef.current;
    
    // Apply hue rotation filter for dynamic coloring on all themes
    if (hue !== 0 && theme !== 'Custom') {
        ctx.filter = `hue-rotate(${hue}deg)`;
    }

    // Pre-calculate custom RGBs if needed
    let customStartRgb, customEndRgb;
    if (theme === 'Custom') {
        customStartRgb = hexToRgb(custom.start);
        customEndRgb = hexToRgb(custom.end);
    }

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 1.5;

      let r = 0, g = 0, b = 0;

      switch (theme) {
        case 'Custom':
            if (customStartRgb && customEndRgb) {
                const t = i / bufferLength; // 0 to 1
                r = customStartRgb.r + (customEndRgb.r - customStartRgb.r) * t;
                g = customStartRgb.g + (customEndRgb.g - customStartRgb.g) * t;
                b = customStartRgb.b + (customEndRgb.b - customStartRgb.b) * t;
                // Add intensity based on volume
                const intensity = barHeight / 255;
                r = Math.min(255, r + intensity * 50);
                g = Math.min(255, g + intensity * 50);
                b = Math.min(255, b + intensity * 50);
            }
            break;
        case 'Fire':
            r = 200 + barHeight / 2;
            g = barHeight * 1.5;
            b = 0;
            break;
        case 'Aurora':
            r = 0;
            g = 150 + (i / bufferLength) * 100;
            b = 100 + barHeight;
            break;
        case 'Retro':
            r = 0;
            g = 255;
            b = 0;
            g = 100 + barHeight;
            break;
        case 'Ocean':
            r = 0;
            g = 100 + barHeight;
            b = 200 + (i / bufferLength) * 55;
            break;
        case 'Sunset':
            r = 200 + barHeight / 2;
            g = 50 + (i / bufferLength) * 100;
            b = 50;
            break;
        case 'Matrix':
            r = 0;
            g = 150 + barHeight;
            b = 0;
            break;
        case 'Vapor':
            r = 150 + barHeight;
            g = 50;
            b = 200 + (i / bufferLength) * 55;
            break;
        case 'Default':
        default:
            r = barHeight + 25 * (i / bufferLength);
            g = 250 * (i / bufferLength);
            b = 50;
            break;
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  const playAudio = (requestId?: number) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    // Strict check: if this playAudio call belongs to an old request, die.
    if (requestId && playRequestRef.current !== requestId) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Ensure clean state before creation
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); sourceNodeRef.current.disconnect(); } catch(e){}
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;

    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 200;
    bass.gain.value = eqSettings.bass;

    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 1;
    mid.gain.value = eqSettings.mid;

    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 3000;
    treble.gain.value = eqSettings.treble;

    const gain = ctx.createGain();
    gain.gain.value = eqSettings.volume;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    source.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    sourceNodeRef.current = source;
    bassFilterRef.current = bass;
    midFilterRef.current = mid;
    trebleFilterRef.current = treble;
    gainNodeRef.current = gain;
    analyserRef.current = analyser;

    const offset = pauseTimeRef.current;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;

    setStatus(AudioStatus.PLAYING);
    // Note: drawVisualizer call is removed here as it is triggered by useEffect on status change

    source.onended = () => {
       // Only trigger auto-play if this source is STILL the current one
       // and the user hasn't started something else
       if (sourceNodeRef.current === source && statusRef.current === AudioStatus.PLAYING) {
           const isNaturalEnd = Math.abs(ctx.currentTime - startTimeRef.current - (audioBufferRef.current?.duration || 0)) < 0.5;
           if (isNaturalEnd) {
               playNext();
           }
       }
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        try { 
            sourceNodeRef.current.stop(); 
            sourceNodeRef.current.disconnect(); 
        } catch(e){}
        sourceNodeRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
    setStatus(AudioStatus.IDLE);
    pauseTimeRef.current = 0;
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect(); // Ensure it stops outputting
      } catch(e) {}
      
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      setStatus(AudioStatus.PAUSED);
      cancelAnimationFrame(animationFrameRef.current);
      sourceNodeRef.current = null; // Clear ref so we know nothing is playing
    }
  };

  const currentTrackName = currentTrackIndex >= 0 ? playlist[currentTrackIndex]?.name : '';

  // Configuration for each band's visual theme
  const bandConfigs = [
    { 
        label: 'Bass', 
        val: eqSettings.bass, 
        set: (v: number) => setEqSettings({...eqSettings, bass: v}), 
        min: -20, max: 20, step: 1,
        colorClass: 'from-rose-900/50 to-rose-950',
        borderColor: 'border-rose-900/30',
        thumbColor: '#e11d48', // Rose-600
        trackColor: 'bg-rose-950/50',
        textColor: 'text-rose-400'
    },
    { 
        label: 'Mid', 
        val: eqSettings.mid, 
        set: (v: number) => setEqSettings({...eqSettings, mid: v}), 
        min: -20, max: 20, step: 1,
        colorClass: 'from-emerald-900/50 to-emerald-950',
        borderColor: 'border-emerald-900/30',
        thumbColor: '#10b981', // Emerald-500
        trackColor: 'bg-emerald-950/50',
        textColor: 'text-emerald-400'
    },
    { 
        label: 'Treble', 
        val: eqSettings.treble, 
        set: (v: number) => setEqSettings({...eqSettings, treble: v}), 
        min: -20, max: 20, step: 1,
        colorClass: 'from-sky-900/50 to-sky-950',
        borderColor: 'border-sky-900/30',
        thumbColor: '#0ea5e9', // Sky-500
        trackColor: 'bg-sky-950/50',
        textColor: 'text-sky-400'
    },
    { 
        label: 'Vol', 
        val: eqSettings.volume, 
        set: (v: number) => setEqSettings({...eqSettings, volume: v}), 
        min: 0, max: 2, step: 0.1,
        colorClass: 'from-violet-900/50 to-violet-950',
        borderColor: 'border-violet-900/30',
        thumbColor: '#8b5cf6', // Violet-500
        trackColor: 'bg-violet-950/50',
        textColor: 'text-violet-400'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full gap-4">
        <style>{`
            .fader-track {
                -webkit-appearance: none;
                background: transparent;
                cursor: pointer;
            }
            .fader-track:focus {
                outline: none;
            }
            /* Webkit (Chrome/Safari/Edge) */
            .fader-track::-webkit-slider-runnable-track {
                width: 100%;
                height: 48px; /* Touch area width */
                border-radius: 8px;
                background: transparent;
            }
            .fader-track::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 48px; 
                width: 24px;  
                margin-top: 0px; 
                background: linear-gradient(to right, #3f3f46, #18181b);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.5);
                position: relative;
                z-index: 10;
            }
            /* Firefox */
            .fader-track::-moz-range-track {
                width: 100%;
                height: 48px;
                background: transparent;
            }
            .fader-track::-moz-range-thumb {
                height: 48px;
                width: 24px;
                background: linear-gradient(to right, #3f3f46, #18181b);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 4px;
            }
        `}</style>

        {/* Top Section: Visualizer */}
        <div className="h-48 md:h-64 bg-zinc-950 relative border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 group">
            <canvas 
              ref={canvasRef} 
              width={1000} 
              height={256} 
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Visualizer Theme Selector Panel */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 backdrop-blur p-4 rounded-xl border border-zinc-700/50 shadow-2xl w-64">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400"><PaletteIcon /></span>
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Visualizer Style</span>
                </div>
                
                <div className="space-y-4">
                    {/* Theme Select */}
                    <div>
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Theme</label>
                        <div className="relative">
                            <select 
                                value={visualizerTheme} 
                                onChange={(e) => setVisualizerTheme(e.target.value)}
                                className="w-full bg-zinc-800 text-xs text-black outline-none p-2 rounded-lg border border-zinc-700 appearance-none cursor-pointer hover:border-zinc-500 transition-colors"
                            >
                                <option value="Default" className="text-black">Neon (Default)</option>
                                <option value="Ocean" className="text-black">Ocean</option>
                                <option value="Sunset" className="text-black">Sunset</option>
                                <option value="Fire" className="text-black">Fire</option>
                                <option value="Aurora" className="text-black">Aurora</option>
                                <option value="Retro" className="text-black">Retro</option>
                                <option value="Matrix" className="text-black">Matrix</option>
                                <option value="Vapor" className="text-black">Vapor</option>
                                <option value="Custom" className="text-black">Custom Gradient</option>
                            </select>
                            <div className="absolute right-2 top-2 pointer-events-none text-zinc-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Custom Gradient Controls */}
                    {visualizerTheme === 'Custom' && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Low Freq</label>
                                <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg border border-zinc-700">
                                    <input 
                                        type="color" 
                                        value={customColors.start}
                                        onChange={(e) => setCustomColors({...customColors, start: e.target.value})}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <span className="text-[10px] font-mono text-zinc-400">{customColors.start}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">High Freq</label>
                                <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg border border-zinc-700">
                                    <input 
                                        type="color" 
                                        value={customColors.end}
                                        onChange={(e) => setCustomColors({...customColors, end: e.target.value})}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                    />
                                    <span className="text-[10px] font-mono text-zinc-400">{customColors.end}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hue Rotation (Global) */}
                    {visualizerTheme !== 'Custom' && (
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase">Color Shift</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{visualizerHue}°</span>
                             </div>
                             <input 
                                type="range" 
                                min="-180" max="180" 
                                value={visualizerHue}
                                onChange={(e) => setVisualizerHue(Number(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                             />
                        </div>
                    )}
                </div>
             </div>

            {!currentTrackName && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                <span className="text-sm tracking-wider uppercase">Visualizer Standby</span>
              </div>
            )}
             {currentTrackName && (
                 <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full text-xs text-zinc-300 border border-zinc-700/50 flex items-center gap-2 shadow-lg">
                   <span className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full"></span>
                   Now Playing: <span className="text-indigo-400 font-medium truncate max-w-[200px]">{currentTrackName}</span>
               </div>
            )}
        </div>

        {/* Bottom Section: Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
            
            {/* Left Column: EQ & Controls */}
            <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto shadow-inner">
                
                 {/* Transport Controls */}
                 <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xl border border-zinc-700/50 shadow-lg gap-4 flex-shrink-0 relative overflow-hidden">
                     {/* Decorative top sheen */}
                     <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                     
                     <div className="flex items-center gap-6 md:gap-8 relative z-10">
                        {/* Shuffle Button */}
                        <button 
                            onClick={() => setIsShuffle(!isShuffle)}
                            className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
                        >
                            <ShuffleIcon />
                        </button>

                        <button onClick={playPrev} className="text-zinc-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full active:scale-95">
                            <BackwardIcon />
                        </button>
                        
                        <button 
                            onClick={status === AudioStatus.PLAYING ? pauseAudio : () => playAudio(playRequestRef.current)}
                            disabled={!currentTrackName}
                            className={`p-6 rounded-full transition-all shadow-2xl border-4 ${
                                !currentTrackName 
                                ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed' 
                                : 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-indigo-900 text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            }`}
                        >
                            {status === AudioStatus.PLAYING ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        <button onClick={playNext} className="text-zinc-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full active:scale-95">
                            <ForwardIcon />
                        </button>
                        
                        {/* Spacer for balance */}
                        <div className="w-9 h-9 opacity-0"></div>
                     </div>
                     <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${status === AudioStatus.PLAYING ? 'text-indigo-400 animate-pulse' : 'text-zinc-600'}`}>{status}</span>
                 </div>

                 {/* EQ Sliders - Professional Mixing Console Style */}
                 <div className="grid grid-cols-4 gap-2 h-full min-h-[350px] items-center">
                    {bandConfigs.map((slider) => (
                        <div key={slider.label} className={`relative rounded-xl border ${slider.borderColor} bg-gradient-to-b ${slider.colorClass} flex flex-col items-center py-4 gap-4 h-full shadow-lg group transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                            {/* Screw heads decoration */}
                            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-700 shadow-inner"></div>
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-700 shadow-inner"></div>
                            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-700 shadow-inner"></div>
                            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-700 shadow-inner"></div>

                            <span className={`font-bold text-[10px] uppercase tracking-widest ${slider.textColor} drop-shadow-md`}>{slider.label}</span>
                            
                            {/* Slider Container */}
                            <div className="flex-1 w-full relative flex items-center justify-center">
                                {/* Track Line - Visual Background */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-1.5 h-[280px] bg-black/50 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,1)] border border-white/5"></div>
                                </div>

                                {/* Frequency Marks - Visual Ticks */}
                                <div className="absolute inset-0 flex flex-col justify-center items-center py-0 pointer-events-none opacity-30 h-[280px] my-auto">
                                    {[...Array(11)].map((_, i) => (
                                        <div key={i} className="absolute w-4 h-px bg-white" style={{ top: `${i * 10}%` }}></div>
                                    ))}
                                </div>

                                {/* The Actual Input */}
                                {/* 
                                    Correct Logic: 
                                    - The slider is vertical visually, but implemented as a horizontal range input rotated -90deg.
                                    - Width of the input becomes the visual Height of the slider.
                                    - Height of the input becomes the visual Width of the touch area.
                                */}
                                <input 
                                    type="range" 
                                    min={slider.min} max={slider.max} step={slider.step}
                                    value={slider.val}
                                    onChange={(e) => slider.set(Number(e.target.value))}
                                    // Width 280px corresponds to visual height. Height 48px corresponds to visual touch width.
                                    className="fader-track w-[280px] h-12 -rotate-90 absolute appearance-none bg-transparent cursor-pointer z-20"
                                    style={{
                                        // Tint the thumb glow based on the specific slider color
                                        boxShadow: `inset 0 0 0 transparent` 
                                    }}
                                />
                            </div>
                            
                            {/* Value Display */}
                            <div className={`px-2 py-1 rounded bg-black/40 border border-white/5 text-xs font-mono min-w-[3rem] text-center ${slider.textColor}`}>
                                {slider.label === 'Vol' ? `${(slider.val * 100).toFixed(0)}%` : `${slider.val > 0 ? '+' : ''}${slider.val}dB`}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Right Column: Playlist */}
            <div className="lg:w-80 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-200 text-sm flex items-center gap-2">
                        <span className="text-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></span>
                        Playlist <span className="text-zinc-600 ml-1 text-xs">({playlist.length})</span>
                    </h3>
                    <div className="flex items-center gap-1">
                         {playlist.length > 0 && (
                            <button 
                                type="button"
                                onClick={clearPlaylist}
                                className="p-2 hover:bg-zinc-800 rounded-md cursor-pointer text-zinc-400 hover:text-red-400 transition-colors"
                                title="Clear All"
                            >
                                <Trash2Icon />
                            </button>
                         )}
                         <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                         <label className="p-2 hover:bg-zinc-800 rounded-md cursor-pointer text-zinc-400 hover:text-indigo-400 transition-colors" title="Add Files">
                            <FilePlusIcon />
                            {/* Explicit accept attribute to force file type dropdown in OS dialog */}
                            <input type="file" multiple accept=".mp3,.wav,.ogg,.m4a,.flac,audio/*" onChange={(e) => addToPlaylist(e.target.files)} className="hidden" />
                         </label>
                         <label className="p-2 hover:bg-zinc-800 rounded-md cursor-pointer text-zinc-400 hover:text-indigo-400 transition-colors" title="Add Folder">
                            <FolderPlusIcon />
                            <input 
                                type="file" 
                                {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
                                onChange={(e) => addToPlaylist(e.target.files)} 
                                className="hidden" 
                            />
                         </label>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isRestoring && (
                        <div className="p-4 text-center text-zinc-500 text-xs animate-pulse">Restoring library...</div>
                    )}
                    {!isRestoring && playlist.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 p-8 text-center opacity-50">
                            <MusicIcon />
                            <p className="text-xs">Drop files or folders here to start</p>
                        </div>
                    )}
                    {playlist.map((file, idx) => (
                        <div 
                            key={`${file.name}-${idx}`}
                            onClick={() => playTrack(idx)}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                                idx === currentTrackIndex 
                                ? 'bg-indigo-600/10 border-indigo-500/30' 
                                : 'hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`text-xs w-4 ${idx === currentTrackIndex ? 'text-indigo-400' : 'text-zinc-600'}`}>
                                    {idx === currentTrackIndex ? <span className="animate-pulse">▶</span> : idx + 1}
                                </span>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-sm truncate font-medium ${idx === currentTrackIndex ? 'text-indigo-300' : 'text-zinc-300 group-hover:text-white'}`}>
                                        {file.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => removeFromPlaylist(idx, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Equalizer;