import { Board, Piece, Position, Move, Color, GameState } from './types';
import { createInitialBoard, isValidPosition, positionsEqual, copyBoard } from './utils';

export class ChessGame {
  private state: GameState;

  constructor() {
    this.state = this.createInitialGameState();
  }

  private createInitialGameState(): GameState {
    return {
      board: createInitialBoard(),
      currentPlayer: 'white',
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      canCastleKingSide: { white: true, black: true },
      canCastleQueenSide: { white: true, black: true },
      enPassantTarget: null,
    };
  }

  getGameState(): GameState {
    return { ...this.state, board: copyBoard(this.state.board) };
  }

  getPossibleMoves(from: Position): Position[] {
    const piece = this.state.board[from.row][from.col];
    if (!piece || piece.color !== this.state.currentPlayer) {
      return [];
    }

    const moves = this.calculateLegalMoves(from, piece);
    return moves.filter(to => this.isLegalMove({ from, to, piece }));
  }

  private calculateLegalMoves(from: Position, piece: Piece): Position[] {
    switch (piece.type) {
      case 'pawn':
        return this.getPawnMoves(from, piece.color);
      case 'rook':
        return this.getRookMoves(from);
      case 'knight':
        return this.getKnightMoves(from);
      case 'bishop':
        return this.getBishopMoves(from);
      case 'queen':
        return this.getQueenMoves(from);
      case 'king':
        return this.getKingMoves(from);
      default:
        return [];
    }
  }

  private getPawnMoves(from: Position, color: Color): Position[] {
    const moves: Position[] = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Forward move
    const oneStep = { row: from.row + direction, col: from.col };
    if (isValidPosition(oneStep) && !this.state.board[oneStep.row][oneStep.col]) {
      moves.push(oneStep);

      // Two steps from starting position
      if (from.row === startRow) {
        const twoStep = { row: from.row + 2 * direction, col: from.col };
        if (isValidPosition(twoStep) && !this.state.board[twoStep.row][twoStep.col]) {
          moves.push(twoStep);
        }
      }
    }

    // Captures
    const capturePositions = [
      { row: from.row + direction, col: from.col - 1 },
      { row: from.row + direction, col: from.col + 1 }
    ];

    for (const pos of capturePositions) {
      if (isValidPosition(pos)) {
        const target = this.state.board[pos.row][pos.col];
        if (target && target.color !== color) {
          moves.push(pos);
        }
        // En passant
        if (this.state.enPassantTarget && positionsEqual(pos, this.state.enPassantTarget)) {
          moves.push(pos);
        }
      }
    }

    return moves;
  }

  private getRookMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const pos = { row: from.row + dr * i, col: from.col + dc * i };
        if (!isValidPosition(pos)) break;

        const piece = this.state.board[pos.row][pos.col];
        if (!piece) {
          moves.push(pos);
        } else {
          if (piece.color !== this.state.board[from.row][from.col]!.color) {
            moves.push(pos);
          }
          break;
        }
      }
    }

    return moves;
  }

  private getKnightMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of knightMoves) {
      const pos = { row: from.row + dr, col: from.col + dc };
      if (isValidPosition(pos)) {
        const piece = this.state.board[pos.row][pos.col];
        if (!piece || piece.color !== this.state.board[from.row][from.col]!.color) {
          moves.push(pos);
        }
      }
    }

    return moves;
  }

  private getBishopMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const pos = { row: from.row + dr * i, col: from.col + dc * i };
        if (!isValidPosition(pos)) break;

        const piece = this.state.board[pos.row][pos.col];
        if (!piece) {
          moves.push(pos);
        } else {
          if (piece.color !== this.state.board[from.row][from.col]!.color) {
            moves.push(pos);
          }
          break;
        }
      }
    }

    return moves;
  }

  private getQueenMoves(from: Position): Position[] {
    return [...this.getRookMoves(from), ...this.getBishopMoves(from)];
  }

  private getKingMoves(from: Position): Position[] {
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const pos = { row: from.row + dr, col: from.col + dc };
      if (isValidPosition(pos)) {
        const piece = this.state.board[pos.row][pos.col];
        if (!piece || piece.color !== this.state.board[from.row][from.col]!.color) {
          moves.push(pos);
        }
      }
    }

    // Castling
    const color = this.state.board[from.row][from.col]!.color;
    if (color === 'white' && from.row === 7 && from.col === 4) {
      if (this.state.canCastleKingSide.white && !this.state.board[7][5] && !this.state.board[7][6]) {
        moves.push({ row: 7, col: 6 });
      }
      if (this.state.canCastleQueenSide.white && !this.state.board[7][3] && !this.state.board[7][2] && !this.state.board[7][1]) {
        moves.push({ row: 7, col: 2 });
      }
    } else if (color === 'black' && from.row === 0 && from.col === 4) {
      if (this.state.canCastleKingSide.black && !this.state.board[0][5] && !this.state.board[0][6]) {
        moves.push({ row: 0, col: 6 });
      }
      if (this.state.canCastleQueenSide.black && !this.state.board[0][3] && !this.state.board[0][2] && !this.state.board[0][1]) {
        moves.push({ row: 0, col: 2 });
      }
    }

    return moves;
  }

  private isLegalMove(move: Move): boolean {
    const tempState = this.simulateMove(move);
    return !this.isInCheck(tempState.board, this.state.currentPlayer);
  }

  private simulateMove(move: Move): { board: Board } {
    const newBoard = copyBoard(this.state.board);
    newBoard[move.to.row][move.to.col] = move.piece;
    newBoard[move.from.row][move.from.col] = null;
    return { board: newBoard };
  }

  makeMove(from: Position, to: Position): boolean {
    const piece = this.state.board[from.row][from.col];
    if (!piece || piece.color !== this.state.currentPlayer) {
      return false;
    }

    const possibleMoves = this.getPossibleMoves(from);
    const isValidMove = possibleMoves.some(pos => positionsEqual(pos, to));
    if (!isValidMove) {
      return false;
    }

    const capturedPiece = this.state.board[to.row][to.col];
    const move: Move = { from, to, piece, capturedPiece: capturedPiece || undefined };

    // Handle special moves
    this.handleSpecialMoves(move);

    // Make the move
    this.state.board[to.row][to.col] = piece;
    this.state.board[from.row][from.col] = null;
    this.state.moveHistory.push(move);

    // Update castling rights
    this.updateCastlingRights(move);

    // Update en passant target
    this.updateEnPassantTarget(move);

    // Switch players
    this.state.currentPlayer = this.state.currentPlayer === 'white' ? 'black' : 'white';

    // Update game status
    this.updateGameStatus();

    return true;
  }

  private handleSpecialMoves(move: Move): void {
    const { from, to, piece } = move;

    // Castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingSide = to.col > from.col;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? 5 : 3;
      const row = from.row;

      // Move the rook
      this.state.board[row][rookToCol] = this.state.board[row][rookFromCol];
      this.state.board[row][rookFromCol] = null;
      move.isCastling = true;
    }

    // En passant
    if (piece.type === 'pawn' && this.state.enPassantTarget && positionsEqual(to, this.state.enPassantTarget)) {
      const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      this.state.board[capturedPawnRow][to.col] = null;
      move.isEnPassant = true;
    }

    // Pawn promotion
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      move.promoteTo = 'queen';
      piece.type = 'queen';
    }
  }

  private updateCastlingRights(move: Move): void {
    const { from, piece } = move;

    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.state.canCastleKingSide.white = false;
        this.state.canCastleQueenSide.white = false;
      } else {
        this.state.canCastleKingSide.black = false;
        this.state.canCastleQueenSide.black = false;
      }
    }

    if (piece.type === 'rook') {
      if (piece.color === 'white' && from.row === 7) {
        if (from.col === 0) this.state.canCastleQueenSide.white = false;
        if (from.col === 7) this.state.canCastleKingSide.white = false;
      } else if (piece.color === 'black' && from.row === 0) {
        if (from.col === 0) this.state.canCastleQueenSide.black = false;
        if (from.col === 7) this.state.canCastleKingSide.black = false;
      }
    }
  }

  private updateEnPassantTarget(move: Move): void {
    const { from, to, piece } = move;
    
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      this.state.enPassantTarget = {
        row: (from.row + to.row) / 2,
        col: from.col
      };
    } else {
      this.state.enPassantTarget = null;
    }
  }

  private updateGameStatus(): void {
    const currentPlayer = this.state.currentPlayer;
    this.state.isCheck = this.isInCheck(this.state.board, currentPlayer);

    const hasLegalMoves = this.hasLegalMoves(currentPlayer);
    if (!hasLegalMoves) {
      if (this.state.isCheck) {
        this.state.isCheckmate = true;
      } else {
        this.state.isStalemate = true;
      }
    }
  }

  private isInCheck(board: Board, color: Color): boolean {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;

    return this.isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
  }

  private findKing(board: Board, color: Color): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  private isSquareAttacked(board: Board, target: Position, byColor: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === byColor) {
          const from = { row, col };
          const moves = this.calculateLegalMoves(from, piece);
          if (moves.some(pos => positionsEqual(pos, target))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private hasLegalMoves(color: Color): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === color) {
          const moves = this.getPossibleMoves({ row, col });
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getAllLegalMoves(color: Color): Move[] {
    const moves: Move[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[row][col];
        if (piece && piece.color === color) {
          const from = { row, col };
          const possibleMoves = this.getPossibleMoves(from);
          
          for (const to of possibleMoves) {
            const capturedPiece = this.state.board[to.row][to.col];
            moves.push({
              from,
              to,
              piece,
              capturedPiece: capturedPiece || undefined
            });
          }
        }
      }
    }
    
    return moves;
  }

  applyMove(move: Move): void {
    this.makeMove(move.from, move.to);
  }
}