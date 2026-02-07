import ChessBoard from './components/ChessBoard'
import GameInfo from './components/GameInfo'
import MoveHistory from './components/MoveHistory'
import { useChessGame } from './hooks/useChessGame'

export default function App() {
  const { 
    gameState, 
    selectSquare, 
    promotePawn, 
    resetGame,
    gameMode,
    botColor,
    botDifficulty,
    isBotThinking,
    isBoardFlipped,
    startBotGame,
    startPvPGame
  } = useChessGame()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a3e] to-[#24243e] flex flex-col items-center justify-center p-4 sm:p-6" style={{ backgroundImage: 'url("https://pub-166557a34b174b9a90d5376150b1d05a.r2.dev/assets/437d9aa2-7d4a-4726-923b-3bb594958b0a/469ddedb-41eb-439b-a586-a07d6e6d6786/Gemini_Generated_Image_doyr4hdoyr4hdoyr_1770484729665_93bkpm.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 sm:mb-8 tracking-tight">
        ♟ Шахматы
      </h1>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
        {/* Left panel - Game Info */}
        <div className="order-2 lg:order-1 flex flex-col gap-4">
          <GameInfo 
            gameState={gameState} 
            onReset={resetGame}
            gameMode={gameMode}
            botColor={botColor}
            botDifficulty={botDifficulty}
            isBotThinking={isBotThinking}
            onStartBotGame={startBotGame}
            onStartPvPGame={startPvPGame}
          />
        </div>

        {/* Center - Board */}
        <div className="order-1 lg:order-2">
          <ChessBoard
            gameState={gameState}
            onSquareClick={selectSquare}
            onPromote={promotePawn}
            isBoardFlipped={isBoardFlipped}
          />
        </div>

        {/* Right panel - Move History */}
        <div className="order-3">
          <MoveHistory moves={gameState.moves} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-gray-600 text-xs text-center">
        {gameMode === 'bot' && isBotThinking 
          ? '🤖 Бот обдумывает ход...'
          : 'Нажмите на фигуру чтобы выбрать её'}
      </div>
    </div>
  )
}