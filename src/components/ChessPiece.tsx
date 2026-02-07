import { Piece } from '../types/chess'
import { PIECE_UNICODE } from '../utils/chessLogic'

interface ChessPieceProps {
  piece: Piece
  isSelected: boolean
}

export default function ChessPiece({ piece, isSelected }: ChessPieceProps) {
  return (
    <div
      className={`
        animate-piece select-none cursor-pointer
        text-4xl sm:text-5xl md:text-5xl leading-none
        transition-all duration-200 ease-out
        ${isSelected ? 'scale-110 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]' : 'hover:scale-105'}
        ${piece.color === 'white'
          ? 'drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]'
          : 'drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]'}
      `}
      style={{
        filter: piece.color === 'white'
          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
          : undefined
      }}
    >
      {PIECE_UNICODE[piece.color][piece.type]}
    </div>
  )
}