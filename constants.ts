import { TileType } from './types';

// Map: 19 columns x 21 rows
// 1: Wall, 0: Path (Dot), 3: Power (Chai), 4: Ghost House/Empty, 5: Pacman Start, 6: Ghost Start
// Note: We will programmatically place Dots (0) on empty spaces (0) during init
export const RAW_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,4,1,4,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,4,4,4,6,4,4,4,1,0,1,1,1,1],
  [1,4,4,4,0,4,4,1,1,4,1,1,4,4,0,4,4,4,1],
  [1,1,1,1,0,1,4,1,4,4,4,1,4,1,0,1,1,1,1],
  [1,1,1,1,0,1,4,1,1,1,1,1,4,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,5,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export const COLORS = {
  WALL: '#ea580c', // orange-600
  WALL_INNER: '#7c2d12', // orange-900
  BG: '#1c1917', // stone-900
  PACMAN: '#facc15', // yellow-400
  DOT: '#fbbf24', // amber-400
  POWER: '#d97706', // amber-600 (Chai color)
  GHOST_1: '#ef4444', // Red
  GHOST_2: '#ec4899', // Pink
  GHOST_3: '#06b6d4', // Cyan
  GHOST_4: '#f97316', // Orange
  GHOST_SCARED: '#3b82f6', // Blue
  TEXT: '#f5f5f4',
};

export const GAME_SPEED = 3.5; // Pixels per frame
export const GHOST_SPEED = 2.0; 
export const GHOST_SCARED_SPEED = 1.0; 
export const POWER_DURATION = 8000; // ms

// Turban colors for ghosts
export const TURBAN_COLORS = ['#fcd34d', '#86efac', '#fca5a5', '#c4b5fd'];
