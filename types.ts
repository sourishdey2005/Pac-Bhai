export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export interface Position {
  x: number; // Grid X
  y: number; // Grid Y
}

export interface PixelPosition {
  x: number; // Pixel X
  y: number; // Pixel Y
}

export interface Entity extends PixelPosition {
  dir: Direction;
  nextDir: Direction;
  speed: number;
  radius: number;
}

export interface Ghost extends Entity {
  id: number;
  color: string;
  isScared: boolean;
  isDead: boolean;
  baseSpeed: number;
}

export interface Pacman extends Entity {
  mouthOpen: number; // 0 to 1 for animation
  lives: number;
  score: number;
  poweredUpTime: number; // ms remaining
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  DOT = 2, // Samosa
  POWER = 3, // Chai
  GHOST_HOUSE = 4,
  PACMAN_START = 5,
  GHOST_START = 6
}

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER' | 'WON' | 'PAUSED';

export interface GameConfig {
  tileSize: number;
  width: number;
  height: number;
}
