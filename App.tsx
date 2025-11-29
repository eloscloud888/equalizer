import React, { useState, useEffect } from 'react';
import Equalizer from './components/Equalizer';
import ChatBot from './components/ChatBot';
import TextToSpeech from './components/TextToSpeech';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('equalizer');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed)
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true;
    };
    setIsStandalone(checkStandalone());

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      console.log("Install prompt captured");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for display mode changes
    const mq = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches);
    };
    mq.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mq.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
        alert("To install, look for the 'Install' icon in your browser address bar (usually on the right side).");
        return;
    }
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallPrompt(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    });
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
          onClick={() => setCurrentView('equalizer')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
          label="Studio Equalizer"
        />
        
        <SidebarButton 
          active={currentView === 'chat'} 
          onClick={() => setCurrentView('chat')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>}
          label="AI Chatbot"
        />

        <SidebarButton 
          active={currentView === 'tts'} 
          onClick={() => setCurrentView('tts')} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>}
          label="Text to Speech"
        />

        <div className="mt-auto px-4 lg:px-6 flex flex-col gap-4">
           {/* Only show Install button if NOT standalone */}
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
            {currentView === 'chat' && <ChatBot />}
            {currentView === 'tts' && <TextToSpeech />}
         </div>
      </main>
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

export default App;