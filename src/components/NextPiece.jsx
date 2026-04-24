import React from 'react';

const CELL = 24;

const NextPiece = ({ piece }) => {
  if (!piece) return <div className="next-piece-empty" />;

  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const w = cols * CELL;
  const h = rows * CELL;

  return (
    <div className="next-piece-container">
      <svg width={w} height={h}>
        {piece.shape.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={c * CELL + 1} y={r * CELL + 1}
                  width={CELL - 2} height={CELL - 2}
                  fill={piece.color}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={0.5}
                  rx={2}
                />
                <rect
                  x={c * CELL + 2} y={r * CELL + 2}
                  width={CELL - 8} height={3}
                  fill="rgba(255,255,255,0.35)"
                  rx={1}
                />
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default NextPiece;
