import { useState, useCallback, useEffect } from 'react'
import { GameState, Position, PieceColor, PieceType } from '../types/chess'
import {
  createInitialBoard,
  getValidMoves,
  makeMove,
  isKingInCheck,
  hasAnyValidMove,
  isInsufficientMaterial
} from '../utils/chessLogic'
import { getBotMove } from '../utils/chessBot'

const initialState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'white',
  moves: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  isDraw: false,
  selectedPosition: null,
  validMoves: [],
  lastMove: null,
  capturedWhite: [],
  capturedBlack: [],
  enPassantTarget: null,
  promotionPending: null
}

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [gameMode, setGameMode] = useState<'pvp' | 'bot'>('pvp')
  const [botColor, setBotColor] = useState<PieceColor>('black')
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [isBoardFlipped, setIsBoardFlipped] = useState(false)

  // Переворачивание доски в зависимости от режима игры
  useEffect(() => {
    if (gameMode === 'pvp') {
      // В PvP переворачиваем доску каждый ход
      setIsBoardFlipped(gameState.currentPlayer === 'black')
    } else {
      // В игре с ботом доска ориентирована на игрока
      // Если бот белый - игрок черный - доску переворачиваем
      setIsBoardFlipped(botColor === 'white')
    }
  }, [gameMode, gameState.currentPlayer, botColor])

  // Ход бота
  const makeBotMove = useCallback(() => {
    setIsBotThinking(true)
    
    // Небольшая задержка для реалистичности
    setTimeout(() => {
      setGameState(prev => {
        if (prev.isCheckmate || prev.isStalemate || prev.isDraw) {
          setIsBotThinking(false)
          return prev
        }
        
        if (prev.currentPlayer !== botColor) {
          setIsBotThinking(false)
          return prev
        }

        const botMove = getBotMove(prev.board, botColor, prev.enPassantTarget, botDifficulty)
        
        if (!botMove) {
          setIsBotThinking(false)
          return prev
        }

        const newState = executeMove(prev, botMove.from, botMove.to)
        setIsBotThinking(false)
        return newState
      })
    }, 500)
  }, [botColor, botDifficulty])

  // Эффект для хода бота
  useEffect(() => {
    if (gameMode === 'bot' && gameState.currentPlayer === botColor && !isBotThinking) {
      makeBotMove()
    }
  }, [gameMode, gameState.currentPlayer, botColor, isBotThinking, makeBotMove])

  const selectSquare = useCallback((pos: Position) => {
    // Блокируем ходы во время хода бота
    if (gameMode === 'bot' && isBotThinking) return
    
    setGameState(prev => {
      if (prev.isCheckmate || prev.isStalemate || prev.isDraw) return prev
      if (prev.promotionPending) return prev

      // В режиме с ботом блокируем ходы за цвет бота
      if (gameMode === 'bot' && prev.currentPlayer === botColor) return prev

      const { board, currentPlayer, selectedPosition, validMoves, enPassantTarget } = prev
      const clickedPiece = board[pos.row][pos.col]

      // If a piece is selected and we click a valid move
      if (selectedPosition && validMoves.some(m => m.row === pos.row && m.col === pos.col)) {
        const movingPiece = board[selectedPosition.row][selectedPosition.col]

        // Check for pawn promotion
        if (movingPiece && movingPiece.type === 'pawn' && (pos.row === 0 || pos.row === 7)) {
          return {
            ...prev,
            promotionPending: pos
          }
        }

        return executeMove(prev, selectedPosition, pos)
      }

      // Select own piece
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        const moves = getValidMoves(board, pos, enPassantTarget)
        return {
          ...prev,
          selectedPosition: pos,
          validMoves: moves
        }
      }

      // Deselect
      return {
        ...prev,
        selectedPosition: null,
        validMoves: []
      }
    })
  }, [gameMode, botColor, isBotThinking])

  const promotePawn = useCallback((pieceType: PieceType) => {
    setGameState(prev => {
      if (!prev.promotionPending || !prev.selectedPosition) return prev
      return executeMove(prev, prev.selectedPosition, prev.promotionPending, pieceType)
    })
  }, [])

  const resetGame = useCallback(() => {
    setGameState(initialState)
    setIsBotThinking(false)
  }, [])

  const startBotGame = useCallback((color: PieceColor, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setBotColor(color)
    setBotDifficulty(difficulty)
    setGameMode('bot')
    setGameState(initialState)
    setIsBotThinking(false)
  }, [])

  const startPvPGame = useCallback(() => {
    setGameMode('pvp')
    setGameState(initialState)
    setIsBotThinking(false)
  }, [])

  return { 
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
  }
}

function executeMove(prev: GameState, from: Position, to: Position, promotionType?: PieceType): GameState {
  const { newBoard, move, newEnPassantTarget } = makeMove(
    prev.board, from, to, prev.enPassantTarget, promotionType
  )

  const nextPlayer: PieceColor = prev.currentPlayer === 'white' ? 'black' : 'white'
  const isCheck = isKingInCheck(newBoard, nextPlayer)
  const hasValidMove = hasAnyValidMove(newBoard, nextPlayer, newEnPassantTarget)

  const newCapturedWhite = [...prev.capturedWhite]
  const newCapturedBlack = [...prev.capturedBlack]

  if (move.captured) {
    if (move.captured.color === 'white') {
      newCapturedWhite.push(move.captured)
    } else {
      newCapturedBlack.push(move.captured)
    }
  }

  // Add check/mate notation
  if (isCheck && !hasValidMove) {
    move.notation += '#'
  } else if (isCheck) {
    move.notation += '+'
  }

  return {
    ...prev,
    board: newBoard,
    currentPlayer: nextPlayer,
    moves: [...prev.moves, move],
    isCheck,
    isCheckmate: isCheck && !hasValidMove,
    isStalemate: !isCheck && !hasValidMove,
    isDraw: isInsufficientMaterial(newBoard),
    selectedPosition: null,
    validMoves: [],
    lastMove: move,
    capturedWhite: newCapturedWhite,
    capturedBlack: newCapturedBlack,
    enPassantTarget: newEnPassantTarget,
    promotionPending: null
  }
}