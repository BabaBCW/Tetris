import React from 'react';
import Board from './components/Board';
import NextPiece from './components/NextPiece';
import { useGameState } from './hooks/useGameState';
import './App.css';

function App() {
  const {
    board, currentPiece, nextPiece, ghostY,
    score, lines, level, gameOver, paused, started,
    startGame, togglePause, moveLeft, moveRight, moveDown, rotate, hardDrop,
  } = useGameState();

  return (
    <div className="app">
      <div className="scanlines" />
      <div className="game-wrapper">
        {/* Left panel */}
        <div className="side-panel left-panel">
          <div className="logo">
            <span className="logo-t">T</span>
            <span className="logo-e">E</span>
            <span className="logo-t2">T</span>
            <span className="logo-r">R</span>
            <span className="logo-i">I</span>
            <span className="logo-s">S</span>
          </div>
          <div className="stat-card">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score.toString().padStart(6, '0')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">LINES</div>
            <div className="stat-value">{lines.toString().padStart(4, '0')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">LEVEL</div>
            <div className="stat-value level-value">{level + 1}</div>
          </div>
          <div className="level-bar">
            <div
              className="level-fill"
              style={{ width: `${((lines % 10) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Board */}
        <div className="board-wrapper">
          <Board board={board} currentPiece={currentPiece} ghostY={ghostY} />

          {/* Overlays */}
          {!started && !gameOver && (
            <div className="overlay">
              <div className="overlay-title">TETRIS</div>
              <div className="overlay-sub">DevSecOps Edition</div>
              <button className="btn-start" onClick={startGame}>START GAME</button>
              <div className="controls-hint">
                <div>← → Move &nbsp; ↑ Rotate</div>
                <div>↓ Soft drop &nbsp; SPACE Hard drop</div>
                <div>P Pause</div>
              </div>
            </div>
          )}

          {paused && (
            <div className="overlay">
              <div className="overlay-title">PAUSED</div>
              <button className="btn-start" onClick={togglePause}>RESUME</button>
            </div>
          )}

          {gameOver && (
            <div className="overlay">
              <div className="overlay-title">GAME OVER</div>
              <div className="final-score">Score: {score}</div>
              <button className="btn-start" onClick={startGame}>PLAY AGAIN</button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="side-panel right-panel">
          <div className="panel-section">
            <div className="stat-label">NEXT</div>
            <div className="next-wrapper">
              <NextPiece piece={nextPiece} />
            </div>
          </div>

          <div className="panel-section controls-panel">
            <div className="stat-label">CONTROLS</div>
            <div className="controls-list">
              <div className="ctrl-row"><span className="key">←→</span><span>Move</span></div>
              <div className="ctrl-row"><span className="key">↑</span><span>Rotate</span></div>
              <div className="ctrl-row"><span className="key">↓</span><span>Soft drop</span></div>
              <div className="ctrl-row"><span className="key">SPC</span><span>Hard drop</span></div>
              <div className="ctrl-row"><span className="key">P</span><span>Pause</span></div>
            </div>
          </div>

          {started && !gameOver && (
            <div className="panel-section btn-group">
              <button className="btn-action" onClick={togglePause}>
                {paused ? '▶ RESUME' : '⏸ PAUSE'}
              </button>
              <button className="btn-action btn-danger" onClick={startGame}>↺ RESTART</button>
            </div>
          )}

          {/* Mobile controls */}
          <div className="mobile-controls">
            <div className="mc-row">
              <button className="mc-btn" onClick={rotate}>↑</button>
            </div>
            <div className="mc-row">
              <button className="mc-btn" onClick={moveLeft}>←</button>
              <button className="mc-btn" onClick={moveDown}>↓</button>
              <button className="mc-btn" onClick={moveRight}>→</button>
            </div>
            <div className="mc-row">
              <button className="mc-btn mc-wide" onClick={hardDrop}>DROP</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
