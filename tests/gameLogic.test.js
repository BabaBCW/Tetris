import { describe, it, expect } from 'vitest';
import {
  createBoard, randomPiece, rotatePiece,
  isValidPosition, placePiece, clearLines, calcScore,
  BOARD_WIDTH, BOARD_HEIGHT
} from '../src/utils/gameLogic';

describe('createBoard', () => {
  it('creates a board with correct dimensions', () => {
    const board = createBoard();
    expect(board.length).toBe(BOARD_HEIGHT);
    expect(board[0].length).toBe(BOARD_WIDTH);
  });
  it('initializes all cells to null', () => {
    const board = createBoard();
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });
});

describe('randomPiece', () => {
  it('returns a piece with required fields', () => {
    const piece = randomPiece();
    expect(piece).toHaveProperty('type');
    expect(piece).toHaveProperty('shape');
    expect(piece).toHaveProperty('color');
    expect(piece).toHaveProperty('x');
    expect(piece).toHaveProperty('y');
  });
  it('spawns piece near top center', () => {
    const piece = randomPiece();
    expect(piece.y).toBe(0);
    expect(piece.x).toBeGreaterThanOrEqual(0);
    expect(piece.x).toBeLessThan(BOARD_WIDTH);
  });
});

describe('rotatePiece', () => {
  it('rotates an L-shape correctly', () => {
    const shape = [[1,0],[1,0],[1,1]];
    const rotated = rotatePiece(shape);
    expect(rotated.length).toBe(shape[0].length);
    expect(rotated[0].length).toBe(shape.length);
  });
  it('4 rotations return to original', () => {
    const shape = [[1,0,0],[1,1,1]];
    let s = shape;
    for (let i = 0; i < 4; i++) s = rotatePiece(s);
    expect(s).toEqual(shape);
  });
});

describe('isValidPosition', () => {
  it('allows piece at valid position', () => {
    const board = createBoard();
    const piece = randomPiece();
    expect(isValidPosition(board, piece.shape, piece.x, 0)).toBe(true);
  });
  it('blocks piece out of left bound', () => {
    const board = createBoard();
    expect(isValidPosition(board, [[1]], -1, 0)).toBe(false);
  });
  it('blocks piece out of right bound', () => {
    const board = createBoard();
    expect(isValidPosition(board, [[1]], BOARD_WIDTH, 0)).toBe(false);
  });
  it('blocks piece below bottom', () => {
    const board = createBoard();
    expect(isValidPosition(board, [[1]], 0, BOARD_HEIGHT)).toBe(false);
  });
  it('blocks collision with existing cell', () => {
    const board = createBoard();
    board[5][5] = '#ff0000';
    expect(isValidPosition(board, [[1]], 5, 5)).toBe(false);
  });
});

describe('clearLines', () => {
  it('clears a full row and returns count', () => {
    const board = createBoard();
    board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill('#ff0000');
    const { board: newBoard, linesCleared } = clearLines(board);
    expect(linesCleared).toBe(1);
    expect(newBoard[BOARD_HEIGHT - 1].every(c => c === null)).toBe(true);
  });
  it('does not clear partial rows', () => {
    const board = createBoard();
    board[BOARD_HEIGHT - 1][0] = '#ff0000';
    const { linesCleared } = clearLines(board);
    expect(linesCleared).toBe(0);
  });
});

describe('calcScore', () => {
  it('returns 0 for 0 lines', () => expect(calcScore(0, 0)).toBe(0));
  it('returns 100 for 1 line at level 0', () => expect(calcScore(1, 0)).toBe(100));
  it('returns 300 for 2 lines at level 0', () => expect(calcScore(2, 0)).toBe(300));
  it('scales with level', () => expect(calcScore(1, 1)).toBe(200));
});
