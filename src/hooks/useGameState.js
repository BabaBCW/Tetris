import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createBoard, randomPiece, rotatePiece,
  isValidPosition, placePiece, clearLines, calcScore
} from '../utils/gameLogic';

export const useGameState = () => {
  const [board, setBoard] = useState(createBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const boardRef = useRef(board);
  const pieceRef = useRef(currentPiece);
  boardRef.current = board;
  pieceRef.current = currentPiece;

  const spawnPiece = useCallback((next) => {
    const piece = next || randomPiece();
    const upcoming = randomPiece();
    if (!isValidPosition(boardRef.current, piece.shape, piece.x, piece.y)) {
      setGameOver(true);
      return;
    }
    setCurrentPiece(piece);
    setNextPiece(upcoming);
  }, []);

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    const newBoard = placePiece(boardRef.current, piece);
    const { board: clearedBoard, linesCleared } = clearLines(newBoard);
    setBoard(clearedBoard);
    setLines(prev => {
      const total = prev + linesCleared;
      setLevel(Math.floor(total / 10));
      return total;
    });
    setScore(prev => prev + calcScore(linesCleared, Math.floor(lines / 10)));
    spawnPiece(null);
  }, [spawnPiece, lines]);

  const moveDown = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || paused) return;
    if (isValidPosition(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      setCurrentPiece(p => ({ ...p, y: p.y + 1 }));
    } else {
      lockPiece();
    }
  }, [gameOver, paused, lockPiece]);

  const moveLeft = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || paused) return;
    if (isValidPosition(boardRef.current, piece.shape, piece.x - 1, piece.y))
      setCurrentPiece(p => ({ ...p, x: p.x - 1 }));
  }, [gameOver, paused]);

  const moveRight = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || paused) return;
    if (isValidPosition(boardRef.current, piece.shape, piece.x + 1, piece.y))
      setCurrentPiece(p => ({ ...p, x: p.x + 1 }));
  }, [gameOver, paused]);

  const rotate = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || paused) return;
    const rotated = rotatePiece(piece.shape);
    if (isValidPosition(boardRef.current, rotated, piece.x, piece.y))
      setCurrentPiece(p => ({ ...p, shape: rotated }));
  }, [gameOver, paused]);

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || gameOver || paused) return;
    let dropY = piece.y;
    while (isValidPosition(boardRef.current, piece.shape, piece.x, dropY + 1)) dropY++;
    setCurrentPiece(p => ({ ...p, y: dropY }));
    setTimeout(lockPiece, 0);
  }, [gameOver, paused, lockPiece]);

  const startGame = useCallback(() => {
    setBoard(createBoard());
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameOver(false);
    setPaused(false);
    setStarted(true);
    const first = randomPiece();
    const second = randomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
  }, []);

  const togglePause = useCallback(() => {
    if (!started || gameOver) return;
    setPaused(p => !p);
  }, [started, gameOver]);

  // Gravity tick
  useEffect(() => {
    if (!started || gameOver || paused || !currentPiece) return;
    const speed = Math.max(100, 800 - level * 70);
    const id = setInterval(moveDown, speed);
    return () => clearInterval(id);
  }, [started, gameOver, paused, currentPiece, level, moveDown]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); moveLeft();  break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown':  e.preventDefault(); moveDown();  break;
        case 'ArrowUp':    e.preventDefault(); rotate();    break;
        case ' ':          e.preventDefault(); hardDrop();  break;
        case 'p':
        case 'P':          togglePause();                   break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause]);

  // Ghost piece position
  const ghostY = (() => {
    if (!currentPiece) return null;
    let y = currentPiece.y;
    while (isValidPosition(board, currentPiece.shape, currentPiece.x, y + 1)) y++;
    return y;
  })();

  return {
    board, currentPiece, nextPiece, ghostY,
    score, lines, level, gameOver, paused, started,
    startGame, togglePause, moveLeft, moveRight, moveDown, rotate, hardDrop,
  };
};
