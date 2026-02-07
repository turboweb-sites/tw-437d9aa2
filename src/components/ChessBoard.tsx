import { GameState, Position, PieceType } from '../types/chess'
import ChessPiece from './ChessPiece'
import { findKing, PIECE_UNICODE } from '../utils/chessLogic'

interface ChessBoardProps {
  gameState: GameState
  onSquareClick: (pos: Position) => void
  onPromote: (type: PieceType) => void
  isBoardFlipped: boolean
}

export default function ChessBoard({ gameState, onSquareClick, onPromote, isBoardFlipped }: ChessBoardProps) {
  const {
    board, selectedPosition, validMoves, lastMove,
    isCheck, currentPlayer, promotionPending
  } = gameState

  const shouldFlipBoard = isBoardFlipped

  const kingInCheckPos = isCheck ? findKing(board, currentPlayer) : null

  const isSelected = (row: number, col: number) =>
    selectedPosition?.row === row && selectedPosition?.col === col

  const isValidMove = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  const isLastMoveSquare = (row: number, col: number) =>
    (lastMove?.from.row === row && lastMove?.from.col === col) ||
    (lastMove?.to.row === row && lastMove?.to.col === col)

  const isKingInCheck = (row: number, col: number) =>
    kingInCheckPos?.row === row && kingInCheckPos?.col === col

  const files = shouldFlipBoard ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = shouldFlipBoard ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1']

  const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight']

  return (
    <div className="relative">
      {/* Board container with coordinates */}
      <div className="flex flex-col items-center">
        {/* Top file labels */}
        <div className="flex ml-6 sm:ml-8">
          {files.map(f => (
            <div key={f} className="w-10 h-5 sm:w-14 sm:h-6 md:w-16 flex items-center justify-center text-xs text-gray-400 font-mono">
              {f}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Left rank labels */}
          <div className="flex flex-col">
            {ranks.map(r => (
              <div key={r} className="w-6 sm:w-8 h-10 sm:h-14 md:h-16 flex items-center justify-center text-xs text-gray-400 font-mono">
                {r}
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="grid grid-cols-8 border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
            {(shouldFlipBoard ? [...board].reverse() : board).map((row, rowIdx) =>
              (shouldFlipBoard ? [...row].reverse() : row).map((piece, colIdx) => {
                const actualRow = shouldFlipBoard ? 7 - rowIdx : rowIdx
                const actualCol = shouldFlipBoard ? 7 - colIdx : colIdx
                const isDark = (actualRow + actualCol) % 2 === 1
                const selected = isSelected(actualRow, actualCol)
                const valid = isValidMove(actualRow, actualCol)
                const lastMv = isLastMoveSquare(actualRow, actualCol)
                const kingCheck = isKingInCheck(actualRow, actualCol)
                const hasCapture = valid && piece !== null

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16
                      flex items-center justify-center
                      relative cursor-pointer
                      transition-colors duration-150
                      ${isDark
                        ? 'bg-[#779952] hover:bg-[#8aad62]'
                        : 'bg-[#edeed1] hover:bg-[#f5f5dc]'}
                      ${selected ? '!bg-[#f6f669]' : ''}
                      ${lastMv && !selected ? (isDark ? '!bg-[#aaa23a]' : '!bg-[#f6f669]/70') : ''}
                      ${kingCheck ? 'check-flash' : ''}
                    `}
                    onClick={() => onSquareClick({ row: actualRow, col: actualCol })}
                  >
                    {/* Valid move indicator */}
                    {valid && !hasCapture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-black/20" />
                      </div>
                    )}

                    {/* Capture indicator */}
                    {hasCapture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-full h-full border-[3px] sm:border-4 border-black/20 rounded-full" />
                      </div>
                    )}

                    {/* Piece */}
                    {piece && (
                      <ChessPiece piece={piece} isSelected={selected} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Right rank labels */}
          <div className="flex flex-col">
            {ranks.map(r => (
              <div key={r} className="w-6 sm:w-8 h-10 sm:h-14 md:h-16 flex items-center justify-center text-xs text-gray-400 font-mono">
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom file labels */}
        <div className="flex ml-6 sm:ml-8">
          {files.map(f => (
            <div key={f} className="w-10 h-5 sm:w-14 sm:h-6 md:w-16 flex items-center justify-center text-xs text-gray-400 font-mono">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Modal */}
      {promotionPending && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-600 animate-fade-in">
            <p className="text-white text-center mb-3 font-semibold text-sm">Выберите фигуру</p>
            <div className="flex gap-2">
              {promotionPieces.map(pt => (
                <button
                  key={pt}
                  onClick={() => onPromote(pt)}
                  className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center
                    bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all duration-200
                    text-3xl sm:text-4xl hover:scale-110 active:scale-95 border border-gray-500 hover:border-indigo-400"
                >
                  {PIECE_UNICODE[currentPlayer][pt]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}