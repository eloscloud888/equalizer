import React, { useEffect, useRef, useState } from 'react';
import { AudioStatus, EqualizerSettings } from '../types';

// Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const ForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>;
const BackwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>;
const FilePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const FolderPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;

const Equalizer: React.FC = () => {
  const [status, setStatus] = useState<AudioStatus>(AudioStatus.IDLE);
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 1,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for State in callbacks
  const playlistRef = useRef<File[]>([]);
  const currentIndexRef = useRef<number>(-1);
  
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

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
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
    const newFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    setPlaylist(prev => [...prev, ...newFiles]);
    
    // Auto-play if it's the first track added
    if (playlist.length === 0 && newFiles.length > 0) {
      playTrack(0, [...playlist, ...newFiles]);
    }
  };

  const removeFromPlaylist = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylist(prev => {
        const newPlaylist = [...prev];
        newPlaylist.splice(index, 1);
        return newPlaylist;
    });
    // Adjust index if needed
    if (index === currentTrackIndex) {
        stopAudio();
        setCurrentTrackIndex(-1);
    } else if (index < currentTrackIndex) {
        setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const playTrack = async (index: number, currentPlaylist = playlistRef.current) => {
    if (index < 0 || index >= currentPlaylist.length) return;
    
    const file = currentPlaylist[index];
    if (!file) return;

    setCurrentTrackIndex(index);
    setStatus(AudioStatus.IDLE); // Briefly idle while loading
    pauseTimeRef.current = 0;

    // Stop existing
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { /* ignore */ }
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (audioContextRef.current) {
          try {
            const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer);
            audioBufferRef.current = decodedAudio;
            playAudio();
          } catch (err) {
            console.error("Error decoding audio:", err);
            // If error, try next track
            playTrack(index + 1, currentPlaylist);
          }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const playNext = () => {
      if (currentIndexRef.current < playlistRef.current.length - 1) {
          playTrack(currentIndexRef.current + 1);
      }
  };

  const playPrev = () => {
      if (currentIndexRef.current > 0) {
          playTrack(currentIndexRef.current - 1);
      }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 1.5;

      const r = barHeight + 25 * (i / bufferLength);
      const g = 250 * (i / bufferLength);
      const b = 50;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

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
    drawVisualizer();

    source.onended = () => {
       const isNaturalEnd = Math.abs(ctx.currentTime - startTimeRef.current - (audioBufferRef.current?.duration || 0)) < 0.5;
       if (isNaturalEnd) {
           playNext();
       }
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e){}
        sourceNodeRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
    setStatus(AudioStatus.IDLE);
    pauseTimeRef.current = 0;
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      setStatus(AudioStatus.PAUSED);
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const currentTrackName = currentTrackIndex >= 0 ? playlist[currentTrackIndex]?.name : '';

  return (
    <div className="flex flex-col h-full w-full gap-4">
        {/* Top Section: Visualizer */}
        <div className="h-48 md:h-64 bg-zinc-950 relative border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
            <canvas 
              ref={canvasRef} 
              width={1000} 
              height={256} 
              className="w-full h-full object-cover opacity-80"
            />
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
            <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto">
                
                 {/* Transport Controls */}
                 <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/50 rounded-xl border border-zinc-800 gap-4">
                     <div className="flex items-center gap-6">
                        <button onClick={playPrev} className="text-zinc-500 hover:text-white transition-colors p-2">
                            <BackwardIcon />
                        </button>
                        
                        <button 
                            onClick={status === AudioStatus.PLAYING ? pauseAudio : playAudio}
                            disabled={!currentTrackName}
                            className={`p-6 rounded-full transition-all shadow-xl ${
                                !currentTrackName 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95 ring-4 ring-indigo-500/20'
                            }`}
                        >
                            {status === AudioStatus.PLAYING ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        <button onClick={playNext} className="text-zinc-500 hover:text-white transition-colors p-2">
                            <ForwardIcon />
                        </button>
                     </div>
                     <span className="text-zinc-500 text-xs font-mono tracking-widest uppercase">{status}</span>
                 </div>

                 {/* EQ Sliders */}
                 <div className="grid grid-cols-4 gap-2 h-full">
                    {[
                        { label: 'Bass', val: eqSettings.bass, set: (v: number) => setEqSettings({...eqSettings, bass: v}), min: -20, max: 20, step: 1 },
                        { label: 'Mid', val: eqSettings.mid, set: (v: number) => setEqSettings({...eqSettings, mid: v}), min: -20, max: 20, step: 1 },
                        { label: 'Treble', val: eqSettings.treble, set: (v: number) => setEqSettings({...eqSettings, treble: v}), min: -20, max: 20, step: 1 },
                        { label: 'Vol', val: eqSettings.volume, set: (v: number) => setEqSettings({...eqSettings, volume: v}), min: 0, max: 2, step: 0.1 }
                    ].map((slider) => (
                        <div key={slider.label} className="bg-zinc-950/30 rounded-lg border border-zinc-800 flex flex-col items-center py-4 gap-4">
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">{slider.label}</span>
                            <div className="h-full flex items-center w-full justify-center">
                                <input 
                                    type="range" 
                                    min={slider.min} max={slider.max} step={slider.step}
                                    value={slider.val}
                                    onChange={(e) => slider.set(Number(e.target.value))}
                                    className="h-24 md:h-32 -rotate-90 w-12 appearance-none bg-zinc-800 rounded-full overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                            </div>
                            <span className="text-zinc-400 font-mono text-xs">{slider.label === 'Vol' ? `${(slider.val * 100).toFixed(0)}%` : `${slider.val}dB`}</span>
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
                         <label className="p-2 hover:bg-zinc-800 rounded-md cursor-pointer text-zinc-400 hover:text-indigo-400 transition-colors" title="Add Files">
                            <FilePlusIcon />
                            <input type="file" multiple accept="audio/*" onChange={(e) => addToPlaylist(e.target.files)} className="hidden" />
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
                    {playlist.length === 0 && (
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