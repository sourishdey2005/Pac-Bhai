import React, { useState } from 'react';
import PacBhaiGame from './components/PacBhaiGame';
import HowToPlay from './components/HowToPlay';
import { UtensilsCrossed, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleOpenRules = () => {
    setShowHowToPlay(true);
    // If the intro modal is open, close it so we don't have double overlays
    if (showIntro) setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-80" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-white to-orange-500 opacity-80" />

      <header className="w-full max-w-2xl flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-full shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-sm">
              Pac-Bhai
            </h1>
            <p className="text-xs text-stone-400 font-bold tracking-widest uppercase">The Samosa Run</p>
          </div>
        </div>
        <button 
          onClick={handleOpenRules}
          className="p-2 rounded-full hover:bg-stone-800 transition-colors flex items-center gap-1 group"
        >
          <span className="text-xs font-bold text-stone-400 group-hover:text-stone-200 hidden sm:block uppercase tracking-wider">How to Play</span>
          <HelpCircle className="w-6 h-6 text-stone-400 group-hover:text-white" />
        </button>
      </header>

      {/* Main Game Container */}
      <main className="w-full max-w-3xl flex flex-col items-center z-10">
         <PacBhaiGame />
      </main>

      {/* Footer Credits */}
      <footer className="mt-8 z-10 text-center">
        <p className="text-xs text-stone-500">
          Made by <span className="text-stone-300 font-semibold">Sourish Dey</span>
        </p>
        <a 
          href="https://www.linkedin.com/in/sourish-dey-20b170206/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-orange-500 hover:text-orange-400 uppercase tracking-widest hover:underline mt-1 inline-block"
        >
          LinkedIn Profile
        </a>
      </footer>

      {/* How To Play Page Overlay */}
      {showHowToPlay && (
        <HowToPlay onBack={() => setShowHowToPlay(false)} />
      )}

      {/* Instructions Modal (Initial Quick Start) */}
      {showIntro && !showHowToPlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-stone-800 border-2 border-orange-500 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-2xl font-display text-orange-400 mb-4 text-center">Welcome, Ji! 🙏</h2>
            <div className="space-y-4 text-sm text-stone-300">
              <p>Help <strong>Pac-Bhai</strong> navigate the busy streets!</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-yellow-400 rounded-full inline-block"></span> 
                  <span>Eat all <strong>Samosas</strong> to win.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-white rounded-full inline-block bg-orange-700"></span> 
                  <span>Drink <strong>Masala Chai</strong> to chase ghosts!</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-stone-500 rounded inline-block"></span> 
                  <span>Eat 20 Samosas to smash <strong>Cracked Walls</strong>!</span>
                </li>
              </ul>
              <div className="p-3 bg-stone-900 rounded-lg text-center text-xs mt-4 border border-stone-700">
                Use <strong>Arrow Keys</strong> or <strong>Swipe</strong> on mobile.
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleOpenRules}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold py-3 rounded-lg transition-colors"
              >
                Read Guide
              </button>
              <button 
                onClick={() => setShowIntro(false)}
                className="flex-[2] bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95"
              >
                Let's Play!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;