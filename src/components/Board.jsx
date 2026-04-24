import React, { useMemo } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../utils/gameLogic';

const CELL_SIZE = 30;

const Board = ({ board, currentPiece, ghostY }) => {
  const displayBoard = useMemo(() => {
    const b = board.map(row => [...row]);

    // Draw ghost piece
    if (currentPiece && ghostY !== null) {
      currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const ny = ghostY + r;
            const nx = currentPiece.x + c;
            if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH && !b[ny][nx]) {
              b[ny][nx] = 'ghost';
            }
          }
        });
      });
    }

    // Draw active piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const ny = currentPiece.y + r;
            const nx = currentPiece.x + c;
            if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
              b[ny][nx] = currentPiece.color;
            }
          }
        });
      });
    }

    return b;
  }, [board, currentPiece, ghostY]);

  return (
    <div className="board-container">
      <svg
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="game-board"
      >
        {/* Grid lines */}
        {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={i * CELL_SIZE}
            x2={BOARD_WIDTH * CELL_SIZE} y2={i * CELL_SIZE}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}
        {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * CELL_SIZE} y1={0}
            x2={i * CELL_SIZE} y2={BOARD_HEIGHT * CELL_SIZE}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}

        {/* Cells */}
        {displayBoard.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            const isGhost = cell === 'ghost';
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={c * CELL_SIZE + 1}
                  y={r * CELL_SIZE + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  fill={isGhost ? 'transparent' : cell}
                  stroke={isGhost ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isGhost ? 1 : 0.5}
                  strokeDasharray={isGhost ? '4 2' : undefined}
                  rx={2}
                />
                {!isGhost && (
                  <>
                    <rect
                      x={c * CELL_SIZE + 2}
                      y={r * CELL_SIZE + 2}
                      width={CELL_SIZE - 10}
                      height={4}
                      fill="rgba(255,255,255,0.35)"
                      rx={1}
                    />
                    <rect
                      x={c * CELL_SIZE + 2}
                      y={r * CELL_SIZE + 2}
                      width={4}
                      height={CELL_SIZE - 10}
                      fill="rgba(255,255,255,0.2)"
                      rx={1}
                    />
                  </>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default Board;
