import React, { useState, useEffect } from 'react';
import { ChessGame } from './ChessGame';
import { ChessAI } from './ChessAI';
import { ChessBoard } from './ChessBoard';
import { Position, GameState } from './types';
import { Crown, RotateCcw, Cpu, User, AlertCircle } from 'lucide-react';

function App() {
  const [game] = useState(() => new ChessGame());
  const [ai] = useState(() => new ChessAI());
  const [gameState, setGameState] = useState<GameState>(() => game.getGameState());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const updateGameState = () => {
    setGameState(game.getGameState());
  };

  const handleSquareClick = async (position: Position) => {
    if (gameState.currentPlayer === 'black' && !gameState.isCheckmate && !gameState.isStalemate) {
      return; // Don't allow moves during AI turn
    }

    if (selectedSquare) {
      if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
        // Deselect if clicking the same square
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        // Try to make a move
        const moveSuccessful = game.makeMove(selectedSquare, position);
        if (moveSuccessful) {
          setSelectedSquare(null);
          setPossibleMoves([]);
          updateGameState();

          // Trigger AI move after a short delay
          if (!game.getGameState().isCheckmate && !game.getGameState().isStalemate) {
            setTimeout(() => makeAIMove(), 500);
          }
        } else {
          // If move failed, try selecting the new square
          const newMoves = game.getPossibleMoves(position);
          if (newMoves.length > 0) {
            setSelectedSquare(position);
            setPossibleMoves(newMoves);
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      }
    } else {
      // Select a square
      const moves = game.getPossibleMoves(position);
      if (moves.length > 0) {
        setSelectedSquare(position);
        setPossibleMoves(moves);
      }
    }
  };

  const makeAIMove = async () => {
    setIsThinking(true);
    
    // Add a small delay to make the AI thinking visible
    setTimeout(() => {
      const aiMove = ai.getBestMove(game);
      if (aiMove) {
        game.applyMove(aiMove);
        updateGameState();
      }
      setIsThinking(false);
    }, 1000);
  };

  const resetGame = () => {
    const newGame = new ChessGame();
    Object.assign(game, newGame);
    setSelectedSquare(null);
    setPossibleMoves([]);
    updateGameState();
  };

  const getGameStatusMessage = () => {
    if (gameState.isCheckmate) {
      return gameState.currentPlayer === 'white' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
    }
    if (gameState.isStalemate) {
      return 'Game ends in stalemate!';
    }
    if (gameState.isCheck) {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    }
    return '';
  };

  // Auto-trigger AI move on black's turn
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && !gameState.isCheckmate && !gameState.isStalemate && !isThinking) {
      setTimeout(() => makeAIMove(), 500);
    }
  }, [gameState.currentPlayer, gameState.isCheckmate, gameState.isStalemate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="text-yellow-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Chess Master</h1>
            <Crown className="text-yellow-400" size={32} />
          </div>
          <p className="text-slate-300">Play against a sophisticated AI opponent</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game Board */}
          <div className="flex flex-col items-center">
            <ChessBoard
              board={gameState.board}
              selectedSquare={selectedSquare}
              possibleMoves={possibleMoves}
              onSquareClick={handleSquareClick}
              isFlipped={false}
            />
          </div>

          {/* Game Info Panel */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 min-w-[300px]">
            <div className="space-y-6">
              {/* Current Player */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white mb-3">Current Turn</h2>
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                  gameState.currentPlayer === 'white' ? 'bg-white text-black' : 'bg-slate-900 text-white'
                }`}>
                  {gameState.currentPlayer === 'white' ? (
                    <>
                      <User size={20} />
                      <span className="font-semibold">White (You)</span>
                    </>
                  ) : (
                    <>
                      <Cpu size={20} />
                      <span className="font-semibold">Black (AI)</span>
                      {isThinking && (
                        <div className="ml-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Game Status */}
              {getGameStatusMessage() && (
                <div className="text-center">
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                    gameState.isCheckmate ? 'bg-red-900 text-red-100' :
                    gameState.isStalemate ? 'bg-yellow-900 text-yellow-100' :
                    'bg-orange-900 text-orange-100'
                  }`}>
                    <AlertCircle size={20} />
                    <span className="font-semibold">{getGameStatusMessage()}</span>
                  </div>
                </div>
              )}

              {/* AI Status */}
              {isThinking && (
                <div className="text-center">
                  <div className="bg-blue-900 text-blue-100 p-3 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Controls */}
              <div className="space-y-3">
                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  <RotateCcw size={20} />
                  New Game
                </button>
              </div>

              {/* Move History */}
              <div>
                <h3 className="text-white font-semibold mb-2">Recent Moves</h3>
                <div className="bg-slate-900 rounded-lg p-3 h-32 overflow-y-auto">
                  {gameState.moveHistory.length === 0 ? (
                    <p className="text-slate-400 text-sm">No moves yet</p>
                  ) : (
                    <div className="space-y-1">
                      {gameState.moveHistory.slice(-6).map((move, index) => (
                        <div key={index} className="text-sm text-slate-300 font-mono">
                          {Math.floor(index / 2) + 1}. {move.piece.type} {String.fromCharCode(97 + move.from.col)}{8 - move.from.row} → {String.fromCharCode(97 + move.to.col)}{8 - move.to.row}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Game Features */}
              <div>
                <h3 className="text-white font-semibold mb-2">Features</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Full chess rules implemented</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Minimax AI with alpha-beta pruning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Position evaluation tables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Check, checkmate, stalemate detection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
              <div className="space-y-2">
                <p><strong>Click a piece</strong> to select it and see possible moves</p>
                <p><strong>Click a highlighted square</strong> to move your piece</p>
              </div>
              <div className="space-y-2">
                <p><strong>You play as White</strong> and move first</p>
                <p><strong>The AI plays as Black</strong> and uses advanced algorithms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;