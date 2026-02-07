import { GameState, Piece, PieceType, PieceColor } from '../types/chess'
import { PIECE_UNICODE } from '../utils/chessLogic'

interface GameInfoProps {
  gameState: GameState
  onReset: () => void
  gameMode: 'pvp' | 'bot'
  botColor?: PieceColor
  botDifficulty?: 'easy' | 'medium' | 'hard'
  isBotThinking?: boolean
  onStartBotGame: (color: PieceColor, difficulty: 'easy' | 'medium' | 'hard') => void
  onStartPvPGame: () => void
}

const pieceValue: Record<PieceType, number> = {
  queen: 9, rook: 5, bishop: 3, knight: 3, pawn: 1, king: 0
}

function sortCaptured(pieces: Piece[]): Piece[] {
  return [...pieces].sort((a, b) => pieceValue[b.type] - pieceValue[a.type])
}

function getMaterialDiff(capturedWhite: Piece[], capturedBlack: Piece[]): number {
  const whiteValue = capturedBlack.reduce((s, p) => s + pieceValue[p.type], 0)
  const blackValue = capturedWhite.reduce((s, p) => s + pieceValue[p.type], 0)
  return whiteValue - blackValue
}

const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно'
}

export default function GameInfo({ 
  gameState, 
  onReset, 
  gameMode,
  botColor,
  botDifficulty,
  isBotThinking,
  onStartBotGame,
  onStartPvPGame
}: GameInfoProps) {
  const {
    currentPlayer, isCheck, isCheckmate, isStalemate, isDraw,
    capturedWhite, capturedBlack, moves
  } = gameState

  const materialDiff = getMaterialDiff(capturedWhite, capturedBlack)
  const gameOver = isCheckmate || isStalemate || isDraw

  let statusText = ''
  let statusColor = 'text-gray-300'

  if (isBotThinking) {
    statusText = '🤖 Бот думает...'
    statusColor = 'text-blue-400'
  } else if (isCheckmate) {
    const winner = currentPlayer === 'white' ? 'Чёрные' : 'Белые'
    statusText = `♔ Мат! ${winner} победили!`
    statusColor = 'text-yellow-400'
  } else if (isStalemate) {
    statusText = '🤝 Пат — ничья!'
    statusColor = 'text-blue-400'
  } else if (isDraw) {
    statusText = '🤝 Ничья — недостаточно материала'
    statusColor = 'text-blue-400'
  } else if (isCheck) {
    statusText = '⚠️ Шах!'
    statusColor = 'text-red-400'
  } else {
    statusText = currentPlayer === 'white' ? 'Ход белых' : 'Ход чёрных'
  }

  return (
    <div className="w-full max-w-xs space-y-4">
      {/* Game mode selector */}
      {moves.length === 0 && (
        <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700 space-y-3">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Режим игры</h3>
          
          <div className="flex gap-2">
            <button
              onClick={onStartPvPGame}
              className={`
                flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                ${gameMode === 'pvp' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }
              `}
            >

            </button>
            <button
              onClick={() => onStartBotGame('black', 'medium')}
              className={`
                flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                ${gameMode === 'bot' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              🤖 Бот
            </button>
          </div>

          {gameMode === 'bot' && (
            <>
              <div className="space-y-2">
                <label className="text-gray-400 text-xs">Цвет игрока:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStartBotGame('black', botDifficulty || 'medium')}
                    className={`
                      flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                      ${botColor === 'black'
                        ? 'bg-white text-black shadow-lg'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }
                    `}
                  >
                    ♔ Белые
                  </button>
                  <button
                    onClick={() => onStartBotGame('white', botDifficulty || 'medium')}
                    className={`
                      flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                      ${botColor === 'white'
                        ? 'bg-gray-900 text-white border-2 border-gray-500 shadow-lg'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }
                    `}
                  >
                    ♚ Чёрные
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 text-xs">Сложность:</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => onStartBotGame(botColor || 'black', diff)}
                      className={`
                        flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all
                        ${botDifficulty === diff
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                        }
                      `}
                    >
                      {difficultyLabels[diff]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Player indicator */}
      <div className={`
        bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700
        ${gameOver ? 'border-yellow-500/50' : ''}
      `}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`
            w-4 h-4 rounded-full transition-all duration-300
            ${currentPlayer === 'white' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-gray-900 border-2 border-gray-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]'}
            ${isBotThinking ? 'animate-pulse' : ''}
          `} />
          <span className={`font-bold text-lg ${statusColor} transition-colors duration-300`}>
            {statusText}
          </span>
        </div>

        <div className="text-gray-500 text-sm">
          Ход {Math.floor(moves.length / 2) + 1}
          {gameMode === 'bot' && (
            <span className="ml-2 text-indigo-400">
              vs {difficultyLabels[botDifficulty || 'medium']} Бот
            </span>
          )}
        </div>
      </div>

      {/* Captured pieces */}
      <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700 space-y-3">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Взятые фигуры</h3>

        {/* Black captured (pieces white took) */}
        <div className="flex items-center gap-1 min-h-[28px]">
          <span className="text-xs text-gray-500 w-8">♔</span>
          <div className="flex flex-wrap gap-0.5">
            {sortCaptured(capturedBlack).map((p, i) => (
              <span key={i} className="text-xl animate-piece" title={p.type}>
                {PIECE_UNICODE.black[p.type]}
              </span>
            ))}
          </div>
          {materialDiff > 0 && (
            <span className="text-green-400 text-xs ml-auto font-bold">+{materialDiff}</span>
          )}
        </div>

        {/* White captured (pieces black took) */}
        <div className="flex items-center gap-1 min-h-[28px]">
          <span className="text-xs text-gray-500 w-8">♚</span>
          <div className="flex flex-wrap gap-0.5">
            {sortCaptured(capturedWhite).map((p, i) => (
              <span key={i} className="text-xl animate-piece" title={p.type}>
                {PIECE_UNICODE.white[p.type]}
              </span>
            ))}
          </div>
          {materialDiff < 0 && (
            <span className="text-green-400 text-xs ml-auto font-bold">+{Math.abs(materialDiff)}</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={onReset}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
          text-white font-semibold py-3 px-4 rounded-xl
          transition-all duration-200 hover:scale-[1.02] active:scale-95
          shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
      >

      </button>
    </div>
  )
}