import { Board, Piece, Position, Color } from './types';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as const;
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'black' };
    board[7][col] = { type: backRank[col], color: 'white' };
  }
  
  return board;
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

export const copyBoard = (board: Board): Board => {
  return board.map(row => [...row]);
};

export const getPieceSymbol = (piece: Piece): string => {
  const symbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };
  return symbols[piece.color][piece.type];
};