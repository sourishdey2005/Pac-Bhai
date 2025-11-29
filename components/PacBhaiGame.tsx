import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RAW_MAP, COLORS, GAME_SPEED, GHOST_SPEED, GHOST_SCARED_SPEED, POWER_DURATION, TURBAN_COLORS, WALL_BREAK_THRESHOLD } from '../constants';
import { TileType, Direction, GameState, Pacman, Ghost, Entity } from '../types';
import { getGameCommentary } from '../services/geminiService';
import { RefreshCw, Play, Pause, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Hammer } from 'lucide-react';

const MAP_ROWS = RAW_MAP.length;
const MAP_COLS = RAW_MAP[0].length;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const PacBhaiGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs (Mutable for loop performance)
  const gameStateRef = useRef<GameState>('START');
  const pacmanRef = useRef<Pacman>({ x: 0, y: 0, dir: 'NONE', nextDir: 'NONE', speed: GAME_SPEED, radius: 0, mouthOpen: 0, lives: 3, score: 0, poweredUpTime: 0 });
  const ghostsRef = useRef<Ghost[]>([]);
  const mapRef = useRef<number[][]>([]); // Mutable map for eating dots
  const particlesRef = useRef<Particle[]>([]);
  const samosasEatenRef = useRef<number>(0);

  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const mouthOpenDirRef = useRef<number>(1); // 1 for opening, -1 for closing

  // React State for UI
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [samosasEaten, setSamosasEaten] = useState(0);
  const [uiState, setUiState] = useState<GameState>('START');
  const [commentary, setCommentary] = useState<string>('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context (Simple Synth)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initMap = useCallback(() => {
    // Deep copy map
    const newMap = RAW_MAP.map(row => [...row]);
    const ghosts: Ghost[] = [];
    let ghostId = 0;

    // Parse Map for Start Positions
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        if (RAW_MAP[r][c] === TileType.PACMAN_START) {
          pacmanRef.current.x = c * 20 + 10; // Placeholder, updated on resize
          pacmanRef.current.y = r * 20 + 10;
          pacmanRef.current.dir = 'NONE';
          pacmanRef.current.nextDir = 'NONE';
        } else if (RAW_MAP[r][c] === TileType.GHOST_START) {
          ghosts.push({
            id: ghostId++,
            x: c * 20 + 10,
            y: r * 20 + 10,
            dir: ['LEFT', 'RIGHT'][ghostId % 2] as Direction, // Start moving laterally
            nextDir: 'NONE',
            speed: GHOST_SPEED,
            radius: 0,
            color: [COLORS.GHOST_1, COLORS.GHOST_2, COLORS.GHOST_3, COLORS.GHOST_4][ghostId % 4],
            isScared: false,
            isDead: false,
            baseSpeed: GHOST_SPEED
          });
        }
      }
    }
    mapRef.current = newMap;
    ghostsRef.current = ghosts;
    particlesRef.current = [];
  }, []);

  // Sound Synth Helper
  const playSound = useCallback((type: 'chomp' | 'power' | 'die' | 'win' | 'break') => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if(ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'chomp') {
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'power') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'die') {
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'break') {
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    }
  }, [soundEnabled]);

  const createParticles = (x: number, y: number, color: string) => {
      for(let i=0; i<10; i++) {
          particlesRef.current.push({
              x, y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1.0,
              color: color
          });
      }
  };

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      gameStateRef.current = 'PAUSED';
      setUiState('PAUSED');
    } else if (gameStateRef.current === 'PAUSED') {
      gameStateRef.current = 'PLAYING';
      setUiState('PLAYING');
    }
  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key.toLowerCase() === 'p') {
        if(e.code === 'Space') e.preventDefault();
        togglePause();
        return;
      }

      if (gameStateRef.current !== 'PLAYING') return;
      
      switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); pacmanRef.current.nextDir = 'UP'; break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); pacmanRef.current.nextDir = 'DOWN'; break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); pacmanRef.current.nextDir = 'LEFT'; break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); pacmanRef.current.nextDir = 'RIGHT'; break;
      }
    };
    
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) { 
          pacmanRef.current.nextDir = dx > 0 ? 'RIGHT' : 'LEFT';
        }
      } else {
        if (Math.abs(dy) > 30) {
          pacmanRef.current.nextDir = dy > 0 ? 'DOWN' : 'UP';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [togglePause]);

  const handleManualControl = (dir: Direction) => {
    if (gameStateRef.current === 'PLAYING') {
      pacmanRef.current.nextDir = dir;
    }
  };

  const update = useCallback((dt: number, tileSize: number) => {
    if (gameStateRef.current !== 'PLAYING') return;

    const pac = pacmanRef.current;
    
    // Update Particles
    particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 1. Movement Logic
    const moveEntity = (entity: Entity, isPlayer: boolean = false) => {
      const x = entity.x;
      const y = entity.y;
      
      const col = Math.floor(x / tileSize);
      const row = Math.floor(y / tileSize);
      
      const centerX = col * tileSize + tileSize / 2;
      const centerY = row * tileSize + tileSize / 2;
      const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      // Try to change direction
      if (entity.nextDir !== 'NONE' && entity.nextDir !== entity.dir) {
        if (distToCenter < 5) { 
          let nextRow = row;
          let nextCol = col;
          if (entity.nextDir === 'UP') nextRow--;
          if (entity.nextDir === 'DOWN') nextRow++;
          if (entity.nextDir === 'LEFT') nextCol--;
          if (entity.nextDir === 'RIGHT') nextCol++;

          const nextTile = mapRef.current[nextRow]?.[nextCol];
          // Determine if passable
          let passable = false;
          // CRITICAL FIX: explicit undefined check to prevent going off map
          if (nextTile !== undefined && nextTile !== TileType.WALL) {
             if (nextTile === TileType.BREAKABLE_WALL) {
                 // Only player can break, and only if threshold met
                 if (isPlayer && samosasEatenRef.current >= WALL_BREAK_THRESHOLD) passable = true;
                 else passable = false;
             } else {
                 passable = true;
             }
          }

          if (passable) {
             entity.dir = entity.nextDir;
             entity.x = centerX; 
             entity.y = centerY;
          }
        }
      }

      // Move
      let dx = 0; let dy = 0;
      if (entity.dir === 'UP') dy = -1;
      else if (entity.dir === 'DOWN') dy = 1;
      else if (entity.dir === 'LEFT') dx = -1;
      else if (entity.dir === 'RIGHT') dx = 1;

      const nextX = x + dx * entity.speed;
      const nextY = y + dy * entity.speed;
      
      const checkCol = Math.floor((nextX + (dx > 0 ? tileSize/2 : -tileSize/2)) / tileSize);
      const checkRow = Math.floor((nextY + (dy > 0 ? tileSize/2 : -tileSize/2)) / tileSize);
      const checkTile = mapRef.current[checkRow]?.[checkCol];

      let canMove = false;
      // CRITICAL FIX: Treat undefined (out of bounds) as WALL
      if (checkTile !== undefined && checkTile !== TileType.WALL) {
          if (checkTile === TileType.BREAKABLE_WALL) {
             if (isPlayer && samosasEatenRef.current >= WALL_BREAK_THRESHOLD) canMove = true;
             else canMove = false;
          } else {
             canMove = true;
          }
      }

      if (canMove) {
        entity.x = nextX;
        entity.y = nextY;
      } else {
        // We hit a wall.
        // If we are past the center of the current tile in the direction of movement, we must stop/snap.
        // If we are approaching the center, we keep moving until we hit center.
        
        let isPastCenter = false;
        if (entity.dir === 'RIGHT' && entity.x >= centerX) isPastCenter = true;
        else if (entity.dir === 'LEFT' && entity.x <= centerX) isPastCenter = true;
        else if (entity.dir === 'DOWN' && entity.y >= centerY) isPastCenter = true;
        else if (entity.dir === 'UP' && entity.y <= centerY) isPastCenter = true;

        if (isPastCenter) {
            entity.x = centerX;
            entity.y = centerY;
        } else {
            // Approaching center, allow move but clamp to center to avoid overshooting
            if (distToCenter < entity.speed) {
                entity.x = centerX;
                entity.y = centerY;
            } else {
                entity.x = nextX;
                entity.y = nextY;
            }
        }
      }

      // Hard Boundary Clamp (Just in case logic fails or map has holes)
      // This prevents absolutely leaving the screen area
      if (entity.x < 0) entity.x = 0;
      if (entity.x > MAP_COLS * tileSize) entity.x = MAP_COLS * tileSize;
      if (entity.y < 0) entity.y = 0;
      if (entity.y > MAP_ROWS * tileSize) entity.y = MAP_ROWS * tileSize;
    };

    moveEntity(pac, true);

    pac.mouthOpen += 0.1 * mouthOpenDirRef.current;
    if (pac.mouthOpen > 1) { pac.mouthOpen = 1; mouthOpenDirRef.current = -1; }
    if (pac.mouthOpen < 0) { pac.mouthOpen = 0; mouthOpenDirRef.current = 1; }

    // 2. Interaction (Eat, Break)
    const pCol = Math.floor(pac.x / tileSize);
    const pRow = Math.floor(pac.y / tileSize);
    
    if (pRow >= 0 && pRow < MAP_ROWS && pCol >= 0 && pCol < MAP_COLS) {
        const tile = mapRef.current[pRow][pCol];
        if (tile === TileType.DOT) {
          mapRef.current[pRow][pCol] = TileType.EMPTY;
          pac.score += 10;
          samosasEatenRef.current += 1;
          setSamosasEaten(samosasEatenRef.current); // Update UI state
          setScore(pac.score);
          playSound('chomp');
        } else if (tile === TileType.POWER) {
          mapRef.current[pRow][pCol] = TileType.EMPTY;
          pac.score += 50;
          pac.poweredUpTime = POWER_DURATION;
          setScore(pac.score);
          playSound('power');
          ghostsRef.current.forEach(g => {
             g.isScared = true;
             g.speed = GHOST_SCARED_SPEED;
          });
        } else if (tile === TileType.BREAKABLE_WALL) {
            // Because movement logic allowed us here, we assume we have the ability
            mapRef.current[pRow][pCol] = TileType.EMPTY;
            pac.score += 20;
            setScore(pac.score);
            playSound('break');
            createParticles(pac.x, pac.y, COLORS.BREAKABLE_WALL);
        }
    }

    if (pac.poweredUpTime > 0) {
        pac.poweredUpTime -= dt;
        if (pac.poweredUpTime <= 0) {
            pac.poweredUpTime = 0;
            ghostsRef.current.forEach(g => {
                g.isScared = false;
                g.speed = g.baseSpeed;
            });
        }
    }

    // 3. Ghost AI
    ghostsRef.current.forEach(ghost => {
       if (ghost.isDead) return;

       const gCol = Math.floor(ghost.x / tileSize);
       const gRow = Math.floor(ghost.y / tileSize);
       const centerX = gCol * tileSize + tileSize / 2;
       const centerY = gRow * tileSize + tileSize / 2;
       const distToCenter = Math.sqrt(Math.pow(ghost.x - centerX, 2) + Math.pow(ghost.y - centerY, 2));

       if (distToCenter < 5) {
           const options: Direction[] = [];
           const check = (r: number, c: number) => {
               const t = mapRef.current[r]?.[c];
               // CRITICAL FIX: Ghosts must check for undefined (out of bounds)
               return t !== undefined && t !== TileType.WALL && t !== TileType.BREAKABLE_WALL;
           };

           if (check(gRow-1, gCol)) options.push('UP');
           if (check(gRow+1, gCol)) options.push('DOWN');
           if (check(gRow, gCol-1)) options.push('LEFT');
           if (check(gRow, gCol+1)) options.push('RIGHT');

           const reverseDir = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT', NONE: 'NONE' }[ghost.dir];
           const validMoves = options.filter(d => d !== reverseDir);
           
           if (validMoves.length > 0) {
             if (ghost.isScared) {
                ghost.nextDir = validMoves[Math.floor(Math.random() * validMoves.length)];
             } else {
                let targetX = pCol;
                let targetY = pRow;

                if (ghost.id === 0) { targetX = pCol; targetY = pRow; }
                else if (ghost.id === 1) {
                    if (pac.dir === 'UP') targetY = pRow - 4;
                    else if (pac.dir === 'DOWN') targetY = pRow + 4;
                    else if (pac.dir === 'LEFT') targetX = pCol - 4;
                    else if (pac.dir === 'RIGHT') targetX = pCol + 4;
                } else if (ghost.id === 2) {
                    const offX = Math.floor(Math.random() * 5) - 2;
                    const offY = Math.floor(Math.random() * 5) - 2;
                    targetX = pCol + offX;
                    targetY = pRow + offY;
                } else {
                    ghost.nextDir = validMoves[Math.floor(Math.random() * validMoves.length)];
                }

                if (ghost.id !== 3) {
                    let bestDir = validMoves[0];
                    let minDistance = Infinity;

                    validMoves.forEach(dir => {
                        let nextR = gRow;
                        let nextC = gCol;
                        if (dir === 'UP') nextR--;
                        if (dir === 'DOWN') nextR++;
                        if (dir === 'LEFT') nextC--;
                        if (dir === 'RIGHT') nextC++;
                        const distSq = Math.pow(nextC - targetX, 2) + Math.pow(nextR - targetY, 2);
                        if (distSq < minDistance) {
                            minDistance = distSq;
                            bestDir = dir;
                        }
                    });
                    ghost.nextDir = bestDir;
                }
             }
           } else if (options.length > 0) {
             ghost.nextDir = options[0];
           }
       }
       moveEntity(ghost);

       const distToPac = Math.sqrt(Math.pow(ghost.x - pac.x, 2) + Math.pow(ghost.y - pac.y, 2));
       if (distToPac < tileSize * 0.8) {
           if (ghost.isScared) {
               ghost.x = (MAP_COLS/2) * tileSize;
               ghost.y = (MAP_ROWS/2 - 2) * tileSize;
               ghost.isScared = false;
               ghost.speed = ghost.baseSpeed;
               pac.score += 200;
               setScore(pac.score);
               playSound('power');
           } else {
               handleDeath();
           }
       }
    });

    let hasDots = false;
    for (let r=0; r<MAP_ROWS; r++) {
        for (let c=0; c<MAP_COLS; c++) {
            if (mapRef.current[r][c] === TileType.DOT || mapRef.current[r][c] === TileType.POWER) {
                hasDots = true;
                break;
            }
        }
    }
    if (!hasDots) handleWin();

  }, [playSound]);

  const handleDeath = () => {
    playSound('die');
    if (pacmanRef.current.lives > 1) {
        pacmanRef.current.lives -= 1;
        setLives(pacmanRef.current.lives);
        const tileSize = (canvasRef.current?.width || 0) / MAP_COLS;
        pacmanRef.current.x = 9 * tileSize + tileSize/2;
        pacmanRef.current.y = 14 * tileSize + tileSize/2;
        pacmanRef.current.dir = 'NONE';
        pacmanRef.current.nextDir = 'NONE';
        ghostsRef.current.forEach((g, i) => {
             g.x = (MAP_COLS/2 + (i%2==0?1:-1)) * tileSize;
             g.y = (MAP_ROWS/2 - 1) * tileSize;
        });
    } else {
        gameStateRef.current = 'GAME_OVER';
        setUiState('GAME_OVER');
        setLoadingCommentary(true);
        if (pacmanRef.current.score > highScore) setHighScore(pacmanRef.current.score);
        getGameCommentary('GAME_OVER', pacmanRef.current.score).then(text => {
            setCommentary(text);
            setLoadingCommentary(false);
        });
    }
  };

  const handleWin = () => {
      gameStateRef.current = 'WON';
      setUiState('WON');
      setLoadingCommentary(true);
      if (pacmanRef.current.score > highScore) setHighScore(pacmanRef.current.score);
      getGameCommentary('WON', pacmanRef.current.score).then(text => {
          setCommentary(text);
          setLoadingCommentary(false);
      });
  };

  const restartGame = () => {
      initMap();
      pacmanRef.current.lives = 3;
      pacmanRef.current.score = 0;
      pacmanRef.current.mouthOpen = 0;
      samosasEatenRef.current = 0;
      setSamosasEaten(0);
      setScore(0);
      setLives(3);
      setCommentary('');
      gameStateRef.current = 'PLAYING';
      setUiState('PLAYING');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        const maxWidth = Math.min(window.innerWidth - 32, 600);
        const tileSize = Math.floor(maxWidth / MAP_COLS);
        canvas.width = tileSize * MAP_COLS;
        canvas.height = tileSize * MAP_ROWS;
        if (gameStateRef.current === 'START') initMap();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (time: number) => {
        const dt = time - lastTimeRef.current;
        lastTimeRef.current = time;
        const tileSize = canvas.width / MAP_COLS;

        update(dt, tileSize);

        ctx.fillStyle = COLORS.BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Map
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                const tile = mapRef.current[r][c];
                const x = c * tileSize;
                const y = r * tileSize;

                if (tile === TileType.WALL) {
                    ctx.fillStyle = COLORS.WALL;
                    ctx.fillRect(x, y, tileSize, tileSize);
                    ctx.fillStyle = COLORS.WALL_INNER;
                    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                } else if (tile === TileType.BREAKABLE_WALL) {
                    ctx.fillStyle = COLORS.BREAKABLE_WALL;
                    ctx.fillRect(x, y, tileSize, tileSize);
                    // Cracks pattern
                    ctx.strokeStyle = COLORS.BREAKABLE_WALL_DETAIL;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + tileSize/2, y + tileSize/2);
                    ctx.moveTo(x + tileSize - 2, y + 2); ctx.lineTo(x + tileSize/2, y + tileSize/2);
                    ctx.moveTo(x + tileSize/2, y + tileSize - 2); ctx.lineTo(x + tileSize/2, y + tileSize/2);
                    ctx.stroke();
                } else if (tile === TileType.DOT) {
                    ctx.fillStyle = COLORS.DOT;
                    const cx = x + tileSize / 2;
                    const cy = y + tileSize / 2;
                    const size = tileSize / 4;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - size);
                    ctx.lineTo(cx - size, cy + size);
                    ctx.lineTo(cx + size, cy + size);
                    ctx.closePath();
                    ctx.fill();
                } else if (tile === TileType.POWER) {
                    ctx.fillStyle = COLORS.POWER;
                    const cx = x + tileSize / 2;
                    const cy = y + tileSize / 2 + 2;
                    const r = tileSize / 3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI, false);
                    ctx.lineTo(cx + r, cy - r/2);
                    ctx.lineTo(cx - r, cy - r/2);
                    ctx.fill();
                    ctx.strokeStyle = COLORS.POWER;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(cx + r, cy - 2, 3, Math.PI/2, -Math.PI/2, true);
                    ctx.stroke();
                } else if (tile === TileType.GHOST_HOUSE) {
                    ctx.fillStyle = '#292524';
                    ctx.fillRect(x, y, tileSize, tileSize);
                }
            }
        }

        // Draw Particles
        particlesRef.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.globalAlpha = 1.0;
        });

        // Draw Pacman
        const p = pacmanRef.current;
        const px = p.x;
        const py = p.y;
        const pr = tileSize / 2 - 2;
        ctx.fillStyle = COLORS.PACMAN;
        ctx.beginPath();
        let angle = 0;
        if (p.dir === 'RIGHT') angle = 0;
        if (p.dir === 'DOWN') angle = Math.PI / 2;
        if (p.dir === 'LEFT') angle = Math.PI;
        if (p.dir === 'UP') angle = -Math.PI / 2;
        const mouthGap = p.mouthOpen * 0.2 * Math.PI;
        ctx.arc(px, py, pr, angle + mouthGap, angle + 2 * Math.PI - mouthGap);
        ctx.lineTo(px, py);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 4, py - 2);
        ctx.quadraticCurveTo(px, py - 6, px + 4, py - 2);
        ctx.stroke();

        // Draw Ghosts
        ghostsRef.current.forEach((g, idx) => {
             const gx = g.x;
             const gy = g.y;
             const gr = tileSize / 2 - 2;
             ctx.fillStyle = g.isScared ? COLORS.GHOST_SCARED : g.color;
             ctx.beginPath();
             ctx.arc(gx, gy - 2, gr, Math.PI, 0);
             ctx.lineTo(gx + gr, gy + gr);
             for(let i=1; i<=3; i++) {
                 ctx.lineTo(gx + gr - (2*gr/3)*i, gy + gr - (i%2==0?2:0));
             }
             ctx.lineTo(gx - gr, gy + gr);
             ctx.fill();
             if (!g.isScared) {
                 ctx.fillStyle = TURBAN_COLORS[idx % TURBAN_COLORS.length];
                 ctx.beginPath();
                 ctx.ellipse(gx, gy - gr + 2, gr, gr/2, 0, Math.PI, 0);
                 ctx.fill();
                 ctx.fillStyle = '#fff';
                 ctx.beginPath();
                 ctx.arc(gx, gy - gr, 2, 0, Math.PI*2);
                 ctx.fill();
             }
             ctx.fillStyle = '#fff';
             const eyeOffX = 4;
             const eyeOffY = -2;
             ctx.beginPath();
             ctx.arc(gx - eyeOffX, gy + eyeOffY, 3, 0, Math.PI*2);
             ctx.arc(gx + eyeOffX, gy + eyeOffY, 3, 0, Math.PI*2);
             ctx.fill();
             ctx.fillStyle = '#000';
             const dx = p.x - gx;
             const dy = p.y - gy;
             const angleToPac = Math.atan2(dy, dx);
             const pupX = Math.cos(angleToPac) * 1.5;
             const pupY = Math.sin(angleToPac) * 1.5;
             ctx.beginPath();
             ctx.arc(gx - eyeOffX + pupX, gy + eyeOffY + pupY, 1.5, 0, Math.PI*2);
             ctx.arc(gx + eyeOffX + pupX, gy + eyeOffY + pupY, 1.5, 0, Math.PI*2);
             ctx.fill();
        });

        animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [update, initMap]);


  return (
    <div className="flex flex-col items-center gap-4 w-full" ref={containerRef}>
      {/* Top Bar with Score and Hammer Progress */}
      <div className="flex flex-col w-full max-w-[600px] gap-2">
          <div className="flex w-full justify-between items-center bg-stone-800 p-4 rounded-xl border border-stone-700 shadow-xl">
            <div className="flex flex-col">
                <span className="text-xs text-stone-400 uppercase tracking-widest">Score</span>
                <span className="text-2xl font-display text-orange-400">{score}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs text-stone-400 uppercase tracking-widest">Lives</span>
                <div className="flex gap-1">
                    {[...Array(lives)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full" />
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-xs text-stone-400 uppercase tracking-widest">High Score</span>
                <span className="text-2xl font-display text-white">{highScore}</span>
            </div>
          </div>
          
          {/* Samosa / Wall Breaker Progress */}
          <div className="bg-stone-800 p-2 rounded-lg border border-stone-700 flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${samosasEaten >= WALL_BREAK_THRESHOLD ? 'bg-orange-500 animate-pulse' : 'bg-stone-700'}`}>
                  <Hammer size={16} className={samosasEaten >= WALL_BREAK_THRESHOLD ? 'text-white' : 'text-stone-500'} />
              </div>
              <div className="flex-1">
                  <div className="flex justify-between text-[10px] uppercase text-stone-400 font-bold mb-1">
                      <span>{samosasEaten >= WALL_BREAK_THRESHOLD ? "Wall Smash Active!" : "Unlock Wall Smash"}</span>
                      <span>{Math.min(samosasEaten, WALL_BREAK_THRESHOLD)}/{WALL_BREAK_THRESHOLD}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${samosasEaten >= WALL_BREAK_THRESHOLD ? 'bg-gradient-to-r from-orange-500 to-yellow-400' : 'bg-stone-600'}`}
                        style={{ width: `${Math.min((samosasEaten / WALL_BREAK_THRESHOLD) * 100, 100)}%` }}
                      />
                  </div>
              </div>
          </div>
      </div>

      <div className="relative p-2 bg-orange-900 rounded-lg shadow-2xl border-4 border-orange-700">
         <canvas ref={canvasRef} className="rounded bg-black block" />
         
         {uiState === 'START' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                 <button 
                   onClick={restartGame}
                   className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-105 shadow-lg border-2 border-green-400"
                 >
                    <Play size={24} fill="white" />
                    Play Now
                 </button>
             </div>
         )}

         {uiState === 'PAUSED' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                 <div className="bg-stone-800/80 p-4 rounded-full border border-orange-500 shadow-xl">
                     <Pause size={48} className="text-orange-500 fill-orange-500/20" />
                 </div>
             </div>
         )}
         
         {(uiState === 'GAME_OVER' || uiState === 'WON') && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 p-6 text-center backdrop-blur-sm">
                 <h2 className={`text-4xl font-display mb-2 ${uiState === 'WON' ? 'text-green-400' : 'text-red-500'}`}>
                    {uiState === 'WON' ? 'Jeet Gaye!' : 'Khel Khatam!'}
                 </h2>
                 <p className="text-stone-300 text-lg mb-6">Score: {score}</p>
                 
                 <div className="bg-stone-800 p-4 rounded-lg border border-stone-600 mb-6 max-w-xs w-full min-h-[80px] flex items-center justify-center">
                    {loadingCommentary ? (
                        <RefreshCw className="animate-spin text-orange-500" />
                    ) : (
                        <p className="text-sm italic text-orange-200">"{commentary}"</p>
                    )}
                 </div>

                 <button 
                   onClick={restartGame}
                   className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full transform transition hover:scale-105 shadow-lg"
                 >
                    <RefreshCw size={20} />
                    Try Again
                 </button>
             </div>
         )}
      </div>

      <div className="flex flex-col w-full max-w-[600px] mt-2 gap-4">
         <div className="flex justify-between items-center w-full bg-stone-800 p-2 rounded-lg border border-stone-700">
            <div className="flex gap-4">
                <button 
                    onClick={() => setSoundEnabled(!soundEnabled)} 
                    className="text-stone-400 hover:text-white flex items-center gap-2 px-2 py-1 rounded hover:bg-stone-700 transition-colors"
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    <span className="text-xs hidden sm:inline font-bold">Sound</span>
                </button>
                <button 
                    onClick={togglePause} 
                    className="text-stone-400 hover:text-white flex items-center gap-2 px-2 py-1 rounded hover:bg-stone-700 transition-colors"
                >
                    {uiState === 'PAUSED' ? <Play size={20} /> : <Pause size={20} />}
                    <span className="text-xs hidden sm:inline font-bold">{uiState === 'PAUSED' ? "Resume" : "Pause"}</span>
                </button>
            </div>
            <button 
                onClick={restartGame} 
                className="text-red-400 hover:text-red-300 flex items-center gap-2 px-2 py-1 rounded hover:bg-stone-700 transition-colors"
            >
                <RotateCcw size={20} />
                <span className="text-xs hidden sm:inline font-bold">Restart</span>
            </button>
         </div>

         <div className="flex md:hidden justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
                 <button className="p-4 bg-stone-800 rounded-lg active:bg-orange-600 border border-stone-700 shadow-lg touch-manipulation" onPointerDown={() => handleManualControl('UP')}><ArrowUp size={28}/></button>
                 <div className="flex gap-2">
                     <button className="p-4 bg-stone-800 rounded-lg active:bg-orange-600 border border-stone-700 shadow-lg touch-manipulation" onPointerDown={() => handleManualControl('LEFT')}><ArrowLeft size={28}/></button>
                     <button className="p-4 bg-stone-800 rounded-lg active:bg-orange-600 border border-stone-700 shadow-lg touch-manipulation" onPointerDown={() => handleManualControl('DOWN')}><ArrowDown size={28}/></button>
                     <button className="p-4 bg-stone-800 rounded-lg active:bg-orange-600 border border-stone-700 shadow-lg touch-manipulation" onPointerDown={() => handleManualControl('RIGHT')}><ArrowRight size={28}/></button>
                 </div>
            </div>
         </div>

         <div className="hidden md:block text-xs text-stone-500 text-center">
             Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move. <strong>Space</strong> or <strong>P</strong> to Pause.
         </div>
      </div>
    </div>
  );
};

export default PacBhaiGame;