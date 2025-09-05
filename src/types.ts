export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type Color = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promoteTo?: PieceType;
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  currentPlayer: Color;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  canCastleKingSide: { white: boolean; black: boolean };
  canCastleQueenSide: { white: boolean; black: boolean };
  enPassantTarget: Position | null;
}