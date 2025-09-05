import { ChessGame } from './ChessGame';
import { Board, Piece, Move, Color, Position } from './types';
import { copyBoard } from './utils';

export class ChessAI {
  private readonly maxDepth = 4;
  
  // Piece values
  private readonly pieceValues = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  };

  // Position evaluation tables
  private readonly pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];

  private readonly knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  private readonly bishopTable = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  private readonly rookTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ];

  private readonly queenTable = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  private readonly kingMiddleGameTable = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ];

  getBestMove(game: ChessGame): Move | null {
    const gameState = game.getGameState();
    const legalMoves = game.getAllLegalMoves('black');
    
    if (legalMoves.length === 0) {
      return null;
    }

    let bestMove: Move | null = null;
    let bestValue = -Infinity;

    for (const move of legalMoves) {
      const tempGame = this.createGameCopy(game);
      tempGame.applyMove(move);
      
      const value = this.minimax(tempGame, this.maxDepth - 1, -Infinity, Infinity, false);
      
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(game: ChessGame, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    const gameState = game.getGameState();
    
    if (depth === 0 || gameState.isCheckmate || gameState.isStalemate) {
      return this.evaluatePosition(gameState.board);
    }

    const currentPlayer = isMaximizing ? 'black' : 'white';
    const legalMoves = game.getAllLegalMoves(currentPlayer);

    if (isMaximizing) {
      let maxEval = -Infinity;
      
      for (const move of legalMoves) {
        const tempGame = this.createGameCopy(game);
        tempGame.applyMove(move);
        
        const eval_ = this.minimax(tempGame, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      
      return maxEval;
    } else {
      let minEval = Infinity;
      
      for (const move of legalMoves) {
        const tempGame = this.createGameCopy(game);
        tempGame.applyMove(move);
        
        const eval_ = this.minimax(tempGame, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      
      return minEval;
    }
  }

  private evaluatePosition(board: Board): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = this.getPieceValue(piece, { row, col });
          score += piece.color === 'black' ? pieceValue : -pieceValue;
        }
      }
    }

    return score;
  }

  private getPieceValue(piece: Piece, position: Position): number {
    const baseValue = this.pieceValues[piece.type];
    const positionValue = this.getPositionValue(piece, position);
    return baseValue + positionValue;
  }

  private getPositionValue(piece: Piece, position: Position): number {
    const { row, col } = position;
    const adjustedRow = piece.color === 'white' ? 7 - row : row;

    switch (piece.type) {
      case 'pawn':
        return this.pawnTable[adjustedRow][col];
      case 'knight':
        return this.knightTable[adjustedRow][col];
      case 'bishop':
        return this.bishopTable[adjustedRow][col];
      case 'rook':
        return this.rookTable[adjustedRow][col];
      case 'queen':
        return this.queenTable[adjustedRow][col];
      case 'king':
        return this.kingMiddleGameTable[adjustedRow][col];
      default:
        return 0;
    }
  }

  private createGameCopy(game: ChessGame): ChessGame {
    // Create a new game instance and copy the state
    const newGame = new ChessGame();
    const currentState = game.getGameState();
    
    // This is a simplified copy - in a production version,
    // you'd want a proper deep clone method
    (newGame as any).state = {
      ...currentState,
      board: copyBoard(currentState.board),
      moveHistory: [...currentState.moveHistory]
    };
    
    return newGame;
  }
}