import React, { useState, useEffect } from 'react';
import Equalizer from './components/Equalizer';
import ChatBot from './components/ChatBot';
import TextToSpeech from './components/TextToSpeech';
import AudioTranscription from './components/AudioTranscription';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('equalizer');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed)
    const checkStandalone = () => {
      // Check for file protocol (local file execution)
      const isFileProtocol = window.location.protocol === 'file:';
      if (isFileProtocol) {
          setShowInfoModal(true);
      }

      return window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true;
    };
    setIsStandalone(checkStandalone());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const mq = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches);
    };
    mq.addEventListener('change', handleDisplayModeChange);

    // Load API Key from storage
    const storedKey = localStorage.getItem('sonic_gemini_api_key');
    if (storedKey) {
        setApiKey(storedKey);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mq.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
        setShowInfoModal(true);
        return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  const handleViewChange = (view: ViewState) => {
      // Logic to prompt for API key if entering AI features
      if ((view === 'chat' || view === 'tts' || view === 'transcription') && !apiKey) {
          setShowApiKeyModal(true);
      }
      setCurrentView(view);
  };

  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      localStorage.setItem('sonic_gemini_api_key', key);
      setShowApiKeyModal(false);
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <nav className="w-20 lg:w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center lg:items-stretch py-6 gap-2 relative z-20">
        <div className="px-0 lg:px-6 mb-8 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight">Sonic<span className="text-indigo-500">AI</span></span>
        </div>

        <SidebarButton 
          active={currentView === 'equalizer'} 
          onClick={() => handleViewChange('equalizer')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
          label="Studio Equalizer"
        />
        
        <SidebarButton 
          active={currentView === 'chat'} 
          onClick={() => handleViewChange('chat')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>}
          label="AI Chatbot"
        />

        <SidebarButton 
          active={currentView === 'tts'} 
          onClick={() => handleViewChange('tts')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>}
          label="Text to Speech"
        />

        <SidebarButton 
          active={currentView === 'transcription'} 
          onClick={() => handleViewChange('transcription')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>}
          label="Transcribe"
        />

        <div className="mt-auto px-4 lg:px-6 flex flex-col gap-4">
           {!isStandalone && (
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/30 text-center space-y-3">
                  <p className="text-xs text-indigo-200 font-medium">Get the Desktop App</p>
                  <button 
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-indigo-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Install App</span>
                  </button>
              </div>
           )}

            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
              <span className="hidden lg:block text-sm font-medium">API Key</span>
              {apiKey && <span className="w-2 h-2 rounded-full bg-green-500 ml-auto"></span>}
           </button>

           <button 
              onClick={() => setShowInfoModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="hidden lg:block text-sm font-medium">App Info</span>
           </button>

           <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hidden lg:block">
              <p className="text-xs text-zinc-500 mb-2">Powered by</p>
              <div className="flex items-center gap-2 text-zinc-300 font-semibold text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Gemini 2.5 & 3.0
              </div>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-hidden bg-black relative">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none"></div>
         <div className="relative z-10 h-full max-w-7xl mx-auto">
            {currentView === 'equalizer' && <Equalizer />}
            {currentView === 'chat' && <ChatBot apiKey={apiKey} />}
            {currentView === 'tts' && <TextToSpeech apiKey={apiKey} />}
            {currentView === 'transcription' && <AudioTranscription apiKey={apiKey} />}
         </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
          <ApiKeyModal 
            currentKey={apiKey} 
            onSave={handleSaveApiKey} 
            onClose={() => setShowApiKeyModal(false)} 
          />
      )}
    </div>
  );
};

interface SidebarButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 lg:px-6 py-3 transition-all relative rounded-lg lg:rounded-none ${
      active 
        ? 'text-white bg-white/5 lg:bg-transparent' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full hidden lg:block"></div>}
    <span className={`${active ? 'text-indigo-400' : ''}`}>{icon}</span>
    <span className={`hidden lg:block font-medium text-sm ${active ? 'text-white' : ''}`}>{label}</span>
  </button>
);

const ApiKeyModal: React.FC<{currentKey: string, onSave: (k: string) => void, onClose: () => void}> = ({currentKey, onSave, onClose}) => {
    const [inputKey, setInputKey] = useState(currentKey);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-w-md w-full p-6 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="mb-6">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Configure Gemini API</h3>
                    <p className="text-zinc-400 text-sm">
                        To use AI features like Chat, TTS, and Transcription, you need to provide your own Google Gemini API Key.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">API Key</label>
                        <input 
                            type="password" 
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                    </div>
                    
                    <div className="bg-zinc-800 p-3 rounded-lg text-xs text-zinc-400 border border-zinc-700">
                        Don't have a key? Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
                    </div>

                    <button 
                        onClick={() => onSave(inputKey)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Save API Key
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoModal: React.FC<{onClose: () => void}> = ({onClose}) => {
  const url = window.location.href;
  const isFile = window.location.protocol === 'file:';
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'user' | 'dev'>('user');

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-w-lg w-full p-6 relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <h3 className="text-xl font-bold text-white mb-4">Application Info</h3>
        
        {isFile && (
            <div className="mb-4 bg-yellow-900/20 border border-yellow-500/20 p-3 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <div className="text-xs text-yellow-200">
                    <strong>Warning:</strong> You are running this file directly. Features like Microphone and Installation will not work. Please check the "Dev Guide" tab to run it properly.
                </div>
            </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-4">
          <button 
            onClick={() => setTab('user')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'user' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            User Guide
          </button>
          <button 
             onClick={() => setTab('dev')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'dev' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            Dev Guide
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2 space-y-4">
          {tab === 'user' && (
            <>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Install this app on your device for offline access and native performance.
              </p>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center gap-2">
                <input 
                    type="text" 
                    readOnly 
                    value={url} 
                    className="bg-transparent text-zinc-300 text-xs w-full focus:outline-none font-mono"
                />
                <button 
                  onClick={copyUrl}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20">
                <h4 className="text-indigo-300 font-medium text-sm mb-2">Installation Steps:</h4>
                <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-2">
                    <li>Copy the URL above.</li>
                    <li>Open <strong>Google Chrome</strong> or <strong>Edge</strong>.</li>
                    <li>Paste the URL.</li>
                    <li>Click <strong>"Install App"</strong> in the sidebar.</li>
                </ol>
              </div>
            </>
          )}

          {tab === 'dev' && (
            <>
               <p className="text-zinc-400 text-sm">
                 Instructions for running the source code locally.
               </p>
               
               <div className="space-y-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">1. Create Project</p>
                    <code className="text-xs font-mono text-green-400 block">npm create vite@latest my-studio -- --template react-ts</code>
                  </div>
                  
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">2. Install Dependencies</p>
                    <code className="text-xs font-mono text-green-400 block">npm install @google/genai lucide-react</code>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">3. Run Locally</p>
                    <code className="text-xs font-mono text-green-400 block">npm run dev</code>
                  </div>
               </div>

               <div className="bg-red-900/10 p-4 rounded-lg border border-red-500/20">
                 <h4 className="text-red-400 font-medium text-sm mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Troubleshooting
                 </h4>
                 
                 <div className="space-y-4">
                     <div>
                         <p className="text-xs text-zinc-400 mb-1">
                           <strong>Error:</strong> "npm.ps1 cannot be loaded... scripts disabled"
                         </p>
                         <p className="text-xs text-zinc-400">
                           <strong>Fix:</strong> Run in PowerShell:
                           <br/>
                           <code className="bg-black px-1 py-0.5 rounded text-white mt-1 block">Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</code>
                         </p>
                     </div>

                     <div className="pt-2 border-t border-red-500/10">
                         <p className="text-xs text-zinc-400 mb-1">
                           <strong>Error:</strong> "ENOENT: no such file or directory, open 'package.json'"
                         </p>
                         <p className="text-xs text-zinc-400">
                           <strong>Fix:</strong> You are in the wrong folder. Type:
                           <br/>
                           <code className="bg-black px-1 py-0.5 rounded text-white mt-1 block">cd my-studio</code>
                           <span>(or your project folder name)</span>
                         </p>
                     </div>
                 </div>
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;