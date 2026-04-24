export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINOES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' },
};

export const PIECE_KEYS = Object.keys(TETROMINOES);

export const createBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const randomPiece = () => {
  const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  const { shape, color } = TETROMINOES[key];
  return {
    type: key,
    shape,
    color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
    y: 0,
  };
};

export const rotatePiece = (shape) => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      rotated[c][rows - 1 - r] = shape[r][c];
  return rotated;
};

export const isValidPosition = (board, shape, x, y) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
};

export const placePiece = (board, piece) => {
  const newBoard = board.map(row => [...row]);
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) {
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny >= 0) newBoard[ny][nx] = piece.color;
      }
    });
  });
  return newBoard;
};

export const clearLines = (board) => {
  const newBoard = board.filter(row => row.some(cell => !cell));
  const cleared = BOARD_HEIGHT - newBoard.length;
  const empty = Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(null));
  return { board: [...empty, ...newBoard], linesCleared: cleared };
};

export const calcScore = (lines, level) => {
  const base = [0, 100, 300, 500, 800];
  return (base[lines] || 0) * (level + 1);
};
