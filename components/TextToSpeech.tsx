import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/gemini';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{id: string, text: string, buffer: AudioBuffer}[]>([]);

  const generate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await generateSpeech(text, ctx);
      
      const newItem = {
        id: Date.now().toString(),
        text: text,
        buffer: buffer
      };
      
      setHistory(prev => [newItem, ...prev]);
      playBuffer(buffer, ctx);
    } catch (err: any) {
      setError(err.message || "Failed to generate speech.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
    if (ctx.state === 'suspended') ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  const playHistoryItem = (item: {buffer: AudioBuffer}) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    playBuffer(item.buffer, ctx);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      <div className="p-6 bg-zinc-950 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white mb-2">Gemini Text-to-Speech</h2>
        <p className="text-zinc-400 text-sm">Generate lifelike speech using gemini-2.5-flash-preview-tts.</p>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type text here to convert to speech..."
            className="w-full h-32 bg-transparent text-white placeholder-zinc-500 resize-none focus:outline-none text-lg"
          />
          <div className="flex justify-between items-center mt-4">
             <span className="text-xs text-zinc-500">{text.length} chars</span>
             <button
              onClick={generate}
              disabled={!text.trim() || isGenerating}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? 'Generating...' : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  Generate Speech
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="space-y-4">
            <h3 className="text-zinc-400 font-medium uppercase text-xs tracking-wider">Recent Generations</h3>
            {history.length === 0 && (
                <div className="text-center py-8 text-zinc-600 italic">No history yet.</div>
            )}
            {history.map((item) => (
                <div key={item.id} className="bg-zinc-800 p-4 rounded-lg flex items-center justify-between border border-zinc-700 hover:border-zinc-600 transition-colors">
                    <p className="text-zinc-300 truncate max-w-[70%] text-sm">"{item.text}"</p>
                    <button 
                        onClick={() => playHistoryItem(item)}
                        className="p-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
