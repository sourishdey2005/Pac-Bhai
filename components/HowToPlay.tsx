import React from 'react';
import { ArrowLeft, UtensilsCrossed, Hammer, Ghost } from 'lucide-react';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-stone-900 z-50 overflow-y-auto animate-in fade-in duration-300">
       {/* Content container */}
       <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col">
          {/* Header */}
          <header className="flex items-center gap-4 mb-8 sticky top-0 bg-stone-900/95 backdrop-blur py-4 z-10 border-b border-stone-800">
             <button
               onClick={onBack}
               className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
             >
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-3xl font-display text-orange-400">How to Play</h1>
          </header>

          <div className="space-y-8 text-stone-300 pb-10">
             {/* Section 1: The Goal */}
             <section className="bg-stone-800 p-6 rounded-xl border border-stone-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                   <UtensilsCrossed className="text-yellow-400" />
                   The Mission
                </h2>
                <p>
                   <strong>Pac-Bhai</strong> is hungry! Navigate the chaotic streets of Mumbai and eat all the <strong>Samosas</strong> (dots) to win the level.
                </p>
             </section>

             {/* Section 2: Items */}
             <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-4 h-4 bg-amber-400 rotate-45" /> {/* Samosa rep */}
                        <h3 className="font-bold text-white">Samosa</h3>
                    </div>
                    <p className="text-sm">Collect these to increase your score. Eat them all to win!</p>
                 </div>

                 <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-5 h-5 rounded-full bg-amber-600 border-2 border-white" /> {/* Chai rep */}
                        <h3 className="font-bold text-white">Masala Chai</h3>
                    </div>
                    <p className="text-sm">Drink this to power up! The ghosts will turn blue and run away. Catch them for bonus points.</p>
                 </div>
             </section>

             {/* Section 3: The Wall Smash */}
             <section className="bg-gradient-to-br from-stone-800 to-stone-900 p-6 rounded-xl border-2 border-orange-900/50 relative overflow-hidden shadow-orange-900/20 shadow-xl">
                <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
                   <Hammer size={120} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                   <Hammer className="text-orange-500" />
                   New Ability: Wall Smash
                </h2>
                <p className="mb-4 text-stone-300">
                   Some walls are cracked and old. You cannot pass them initially, but Pac-Bhai can learn to break them!
                </p>
                <ul className="space-y-3 text-sm">
                   <li className="flex items-start gap-3">
                      <span className="bg-stone-700 text-stone-200 text-xs font-bold px-2 py-0.5 rounded mt-0.5">STEP 1</span>
                      <span>Eat <strong>20 Samosas</strong> to unlock the Hammer ability. Watch the bar at the top!</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <span className="bg-stone-700 text-stone-200 text-xs font-bold px-2 py-0.5 rounded mt-0.5">STEP 2</span>
                      <span>Walk directly into a <span className="text-stone-400 font-bold border-b border-dashed border-stone-500">Cracked Wall</span>.</span>
                   </li>
                   <li className="flex items-start gap-3">
                      <span className="bg-stone-700 text-stone-200 text-xs font-bold px-2 py-0.5 rounded mt-0.5">STEP 3</span>
                      <span><strong>SMASH!</strong> The wall breaks, creating a new shortcut to escape ghosts.</span>
                   </li>
                </ul>
             </section>

             {/* Section 4: The Gundas */}
             <section className="bg-stone-800 p-6 rounded-xl border border-stone-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <Ghost className="text-red-500" />
                   The Gundas (Ghosts)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-start gap-3 p-2 rounded bg-stone-900/50">
                      <div className="w-8 h-8 rounded-t-lg bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <div>
                         <h3 className="font-bold text-red-400">Bhai (Red)</h3>
                         <p className="text-xs">The leader. He chases you directly and is relentless.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-2 rounded bg-stone-900/50">
                      <div className="w-8 h-8 rounded-t-lg bg-pink-500 shrink-0 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                      <div>
                         <h3 className="font-bold text-pink-400">Pinky (Pink)</h3>
                         <p className="text-xs">Sneaky. She tries to ambush you by cutting off your path.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-2 rounded bg-stone-900/50">
                      <div className="w-8 h-8 rounded-t-lg bg-cyan-500 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                      <div>
                         <h3 className="font-bold text-cyan-400">Inky (Cyan)</h3>
                         <p className="text-xs">Unpredictable. He acts crazy and moves randomly near you.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-2 rounded bg-stone-900/50">
                      <div className="w-8 h-8 rounded-t-lg bg-orange-500 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                      <div>
                         <h3 className="font-bold text-orange-400">Pokey (Orange)</h3>
                         <p className="text-xs">The slacker. He mostly wanders around aimlessly.</p>
                      </div>
                   </div>
                </div>
             </section>

             {/* Section 5: Controls */}
             <section className="text-center p-4">
                <h2 className="text-lg font-bold text-white mb-4">Controls</h2>
                <div className="flex justify-center gap-8 text-stone-400">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">⌨️</div>
                        <p className="text-sm font-bold text-stone-300">Arrow Keys / WASD</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">👆</div>
                        <p className="text-sm font-bold text-stone-300">Swipe on Screen</p>
                    </div>
                </div>
             </section>
             
             <button
               onClick={onBack}
               className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 text-lg"
             >
                Got it! Let's Play
             </button>
          </div>
       </div>
    </div>
  );
};

export default HowToPlay;