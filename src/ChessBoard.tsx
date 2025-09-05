import React from 'react';
import { Board, Position, Piece } from './types';
import { getPieceSymbol } from './utils';

interface ChessBoardProps {
  board: Board;
  selectedSquare: Position | null;
  possibleMoves: Position[];
  onSquareClick: (position: Position) => void;
  isFlipped?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  possibleMoves,
  onSquareClick,
  isFlipped = false
}) => {
  const renderSquare = (row: number, col: number) => {
    const displayRow = isFlipped ? 7 - row : row;
    const displayCol = isFlipped ? 7 - col : col;
    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isPossibleMove = possibleMoves.some(pos => pos.row === row && pos.col === col);

    let squareClass = `w-16 h-16 flex items-center justify-center text-4xl cursor-pointer transition-all duration-200 relative ${
      isLight ? 'bg-amber-100' : 'bg-amber-800'
    }`;

    if (isSelected) {
      squareClass += ' ring-4 ring-blue-500 ring-inset';
    }

    if (isPossibleMove) {
      squareClass += ' ring-2 ring-green-400 ring-inset';
    }

    return (
      <div
        key={`${row}-${col}`}
        className={squareClass}
        onClick={() => onSquareClick({ row, col })}
      >
        {piece && (
          <span className="select-none drop-shadow-sm">
            {getPieceSymbol(piece)}
          </span>
        )}
        {isPossibleMove && !piece && (
          <div className="w-6 h-6 bg-green-400 rounded-full opacity-60" />
        )}
        {/* Square coordinates */}
        <div className="absolute bottom-0 right-0 text-xs font-mono opacity-30 pr-1">
          {String.fromCharCode(97 + displayCol)}{8 - displayRow}
        </div>
      </div>
    );
  };

  return (
    <div className="inline-block border-4 border-amber-900 shadow-2xl bg-amber-900">
      <div className="grid grid-cols-8">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
        )}
      </div>
    </div>
  );
};