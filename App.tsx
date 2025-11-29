import React, { useState } from 'react';
import PacBhaiGame from './components/PacBhaiGame';
import { UtensilsCrossed, Info } from 'lucide-react';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

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
          onClick={() => setShowIntro(!showIntro)}
          className="p-2 rounded-full hover:bg-stone-800 transition-colors"
        >
          <Info className="w-6 h-6 text-stone-400" />
        </button>
      </header>

      {/* Main Game Container */}
      <main className="w-full max-w-3xl flex flex-col items-center z-10">
         <PacBhaiGame />
      </main>

      {/* Instructions Modal */}
      {showIntro && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  <span className="w-4 h-4 bg-red-500 rounded-t-lg inline-block"></span> 
                  <span>Avoid the <strong>Gundas</strong> (Goons)!</span>
                </li>
              </ul>
              <div className="p-3 bg-stone-900 rounded-lg text-center text-xs mt-4 border border-stone-700">
                Use <strong>Arrow Keys</strong> or <strong>Swipe</strong> on mobile.
              </div>
            </div>
            <button 
              onClick={() => setShowIntro(false)}
              className="mt-6 w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95"
            >
              Chalo Shuru Karein! (Let's Start!)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;