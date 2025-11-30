import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/gemini';

interface AudioTranscriptionProps {
  apiKey: string;
}

const AudioTranscription: React.FC<AudioTranscriptionProps> = ({ apiKey }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopVisualization();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startVisualization = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simple waveform/visualizer
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      if (isProcessing) {
        // Loading animation
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (isRecording) {
         // Recording visualizer
         const radius = 30 + (dataArray[30] / 255) * 20;
         ctx.beginPath();
         ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
         ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // red-500
         ctx.fill();
         ctx.strokeStyle = '#ef4444';
         ctx.lineWidth = 2;
         ctx.stroke();

         // Bars
         const bars = 20;
         const step = (Math.PI * 2) / bars;
         
         for(let i=0; i<bars; i++) {
            const val = dataArray[i * 2];
            const barHeight = (val / 255) * 40;
            const angle = i * step;
            const x1 = centerX + Math.cos(angle) * (radius + 5);
            const y1 = centerY + Math.sin(angle) * (radius + 5);
            const x2 = centerX + Math.cos(angle) * (radius + 5 + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + 5 + barHeight);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#ef4444';
            ctx.stroke();
         }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopVisualization = () => {
    cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const startRecording = async () => {
    if (!apiKey) {
        setError("API Key is missing. Please add it in the settings.");
        return;
    }
    setError('');
    setTranscription(''); 
    chunksRef.current = [];
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup MediaRecorder
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else mimeType = ''; // Let browser choose default
      }
      
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stopVisualization();
        stream.getTracks().forEach(track => track.stop());
        
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
        processAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startVisualization(stream);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure permission is granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const result = await transcribeAudio(apiKey, blob);
      setTranscription(result);
    } catch (err: any) {
      setError("Failed to transcribe audio. " + (err.message || 'Check API Key'));
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
  };

  const clearTranscription = () => {
    setTranscription('');
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-white mb-1">Audio Transcription</h2>
            <p className="text-zinc-400 text-sm">Record your voice and let Gemini transcribe it instantly.</p>
        </div>
        <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/20 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-red-500 ${isRecording ? 'animate-pulse' : ''}`}></div>
            {isRecording ? 'Recording' : 'Standby'}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center gap-8 overflow-y-auto relative">
         
         {/* Visualizer / Status Area */}
         <div className="relative w-full max-w-md h-48 flex items-center justify-center shrink-0">
            <canvas ref={canvasRef} width={400} height={200} className="absolute inset-0 w-full h-full" />
            
            {!isRecording && !isProcessing && (
                <button
                    onClick={startRecording}
                    className="relative z-10 w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95 group"
                    title="Start Recording"
                >
                    <svg className="w-10 h-10 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </button>
            )}

            {isRecording && (
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <span className="text-4xl font-mono text-white font-bold tracking-widest">{formatTime(recordingDuration)}</span>
                    <button
                        onClick={stopRecording}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-white text-sm font-medium transition-colors shadow-lg"
                    >
                        Stop Recording
                    </button>
                </div>
            )}

            {isProcessing && (
                <div className="relative z-10 flex flex-col items-center gap-2">
                     <svg className="animate-spin w-10 h-10 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span className="text-zinc-400 text-sm animate-pulse">Transcribing...</span>
                </div>
            )}
         </div>

         {/* Output Area */}
         {error && (
            <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg text-sm text-center">
                {error}
            </div>
         )}

         {transcription && (
             <div className="w-full max-w-2xl bg-zinc-800/50 rounded-xl border border-zinc-700 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Transcription Result</h3>
                    <div className="flex items-center gap-2">
                      <button 
                          onClick={copyToClipboard}
                          className="px-3 py-1.5 bg-zinc-700/50 hover:bg-zinc-700 rounded text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                      >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          Copy
                      </button>
                      <button 
                          onClick={clearTranscription}
                          className="px-3 py-1.5 bg-zinc-700/50 hover:bg-red-900/30 rounded text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          Clear
                      </button>
                    </div>
                 </div>
                 <div className="text-zinc-100 leading-relaxed text-lg whitespace-pre-wrap">
                    {transcription}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default AudioTranscription;